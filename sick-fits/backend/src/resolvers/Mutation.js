const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
  createItem: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must bo logged in to do that!');
    }
    const item = await ctx.db.mutation.createItem(
      { 
        data: {
          // relation between item and user
          user: {
            connect: {
              id: ctx.request.userId,
            }
          },
          ...args
        }
      }, 
      info)
    ;
    return item;
  },
  updateItem: (_, args, ctx, info) => {
    const { id, ...rest } = args;
    return ctx.db.mutation.updateItem(
      {
        data: rest,
        where: {
          id,
        },
      }, 
      info
    );
  },
  deleteItem: async (_, args, ctx, info) => {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(p => ['ADMIN', 'ITEMDELETE'].includes(p));
    if (!ownsItem && !hasPermissions) {
      throw new Error('You don\'t have permission to do that!');
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  signup: async (_, args, ctx, info) => {
    const { email, password } = args;
    console.log(args)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          email: email.toLowerCase(),
          password: hashedPassword,
          permissions: { set: ['USER'] },
        }
      },
      info
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    return user;
  },
  signin: async (_, { email, password }, ctx, info) => {
    const user = await ctx.db.query.user(
      {
        where: { email }
      }
    );
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error(`Invalid password`);
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    return user;
  },
  signout: (_, args, ctx, info) => {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  requestReset: async (_, args, ctx, info) => {
    const { email } = args;
    const user = await ctx.db.query.user(
      {
        where: {
          email,
        }
      }
    );
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    const res = await ctx.db.mutation.updateUser(
      {
        where: {
          email,
        },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      }
    );
    const mailRes = await transport.sendMail(
      {
        form: 'jopa@jopa.jopa',
        to: email,
        subject: 'Your password reset token',
        html: makeANiceEmail(`Your password reset token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">click here</a>`)
      }
    );
    return { message: 'Thanks' };
  },
  resetPassword: async (_, args, ctx, info) => {
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords don\'t match!');
    }
    const [user] = ctx.db.query.users(
      {
        where: {
          resetToken: args.resetToken,
          resetTokenExpiry_gte: Date.now() - 36000000,
        }
      }
    );
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        }
      }
    );
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    return updatedUser;
  },
  updatePermissions: async (_, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        }
      },
      info
    );
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions:{
            set: args.permissions,
          }
        },
        where: {
          id: args.userId,
        }
      },
      info
    );
  },
  addToCart: async (_, args, ctx, info) => {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged in!');
    }
    const [existingCartItem] = await ctx.db.query.cartItems(
      {
        where: {
          user: { id: userId },
          item: { id: args.id },
        }
      }
    );
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          item: {
            connect: {
              id: args.id
            }
          }
        }
      },
      info
    );
  },
  removeFromCart: async (_, args, ctx, info) => {
    const cartItem = await ctx.db.query.cartItem(
      {
        where: { id: args.id },
      },
      `{ id, user { id } }`
    );
    if (!cartItem) {
      throw new Error('No cart item found');
    }
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheating');
    }
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    );
  },
  createOrder: async (_, args, ctx, info) => {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in to complete this order');
    }
    const user = await ctx.db.query.user(
      {
        where: {
          id: userId,
        },
      },
      `{ id name email cart { id quantity item { title price id description image } } }`
    );
    // recalculate the total price
    const amount = user.cart.reduce((acc, cartItem) => acc + cartItem.item.price * cartItem.quantity, 0);
    // create the stripe charge (turn token into money)
    const charge = await stripe.charges.create(
      {
        amount,
        currency: 'USD',
        source: args.token,
      }
    );
    console.log(charge)
    return null;
    // convert the cart items to order items
    // create order
    // clean up - clear the user cart, delete cart items
    // return the order to the client
  }
};

module.exports = Mutations;
