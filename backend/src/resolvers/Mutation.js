const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if user is logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )

    return item
  },
  updateItem(parent, args, ctx, info) {
    // take a copy of the updates
    const updates = { ...args }
    // remove Id from updates
    delete updates.id
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    )
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{id title}`)
    // 2. check if they own that item, or have permissions
    // TODO
    // 3. delete item!
    return ctx.db.mutation.deleteItem({ where }, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    // one way hash user pw
    const password = await bcrypt.hash(args.password, 10)
    // create user in db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args, // name, email, password
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    )
    // create JWT token for users so they're signed in once they sign up
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 yr cookie
    })
    // return the user to the browser
    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    const lowercaseEmail = email.toLowerCase()
    // 1. Check if user with that email exists
    const user = await ctx.db.query.user({ where: { email: lowercaseEmail } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. Check if password matches email
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password!')
    }
    // 3. Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // 4. Set cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // 5. Return the user
    return user
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  }
}

module.exports = Mutations
