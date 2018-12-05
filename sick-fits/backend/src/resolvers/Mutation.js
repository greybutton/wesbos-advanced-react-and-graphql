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
  }
};

module.exports = Mutations;
