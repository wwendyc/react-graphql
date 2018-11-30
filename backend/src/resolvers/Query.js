const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  currentUser(parent, args, ctx, info) {
    // check if there is a current userID
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    )
  },
  async users(parent, args, ctx, info) {
    // 1. Check if user is logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // 2. Check if user has permission to view users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])
    // 3. If yes, query all users
    return ctx.db.query.users({}, info) // [info] returns all the query fields we're requesting
  }
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items()
  //   return items
  // }
}

module.exports = Query
