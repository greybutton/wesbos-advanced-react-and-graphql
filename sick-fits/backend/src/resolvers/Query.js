const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me: (_, args, ctx, info) => {
    const { userId } = ctx.request;
    if (!userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: {
          id: userId,
        },
      },
      info
    );
  },
  users: async (_, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.query.users({}, info);
  }
  // items: async (parent, args, ctx, info) => {
  //   const items = await ctx.db.query.items();
  //   return items;
  // }
};

module.exports = Query;
