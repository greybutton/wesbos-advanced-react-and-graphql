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
  }
};

module.exports = Mutations;
