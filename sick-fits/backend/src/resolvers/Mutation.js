const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  createItem: async (parent, args, ctx, info) => {
    const item = await ctx.db.mutation.createItem(
      { 
        data: { 
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
    const item = await ctx.db.query.item({ where }, `{ id title }`);
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
  }
};

module.exports = Mutations;
