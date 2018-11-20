const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

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
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },
  async reqPwdReset(parent, args, ctx, info) {
    // 1. Check if user exists
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hr from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })
    console.log(res)
    return { message: 'Password reset token generated' }
    // 3. Email reset token to user
  },
  async passwordReset(parent, args, ctx, info) {
    const { resetToken, password, confirmPassword } = args
    // 1. Check if passwords match
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!")
    }
    // 2. Check if reset token is legit
    // 3. Check if token is expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error('Reset token is invalid or expired.')
    }
    // 4. Hash new password
    const newPassword = await bcrypt.hash(password, 10)
    // 5. Save new pwd to the user and remove resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { password: newPassword, resetToken: null, resetTokenExpiry: null }
    })
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // 7. Set the JWT cookie
    ctx.response.cookie('toekn', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // 8. Return the new user
    return updatedUser
  }
}

module.exports = Mutations
