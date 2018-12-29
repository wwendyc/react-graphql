const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const { hasPermission } = require('../utils')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!')
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // Creates a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`)
    // 2. check if they own that item, or have permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasAuthorization = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem && !hasAuthorization) {
      throw new Error('Unauthroized!')
    }
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
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // 2. Query the current user
    const currenUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    )
    // 3. Check if user has permissions to modify user permissions
    hasPermission(currenUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    )
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Check if user is logged in
    const { userId } = ctx.request
    // 2. Query the user's cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    })
    // 3. Check if the item is already in the cart. If so, increment quantity by 1.
    if (existingCartItem) {
      console.log('Item already in cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      )
    }
    // 4. Else, create a fresh CartItem for the user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    )
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user { id }}`
    ) // instead of info, passing a manual query

    // 2. Check if cart item exists
    if (!cartItem) throw new Error('No cart item found!')

    // 3. Make sure the user is the cart owner
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error('No can do, cart owner only action')

    // 4. Delete that item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    )
  }
}

module.exports = Mutations
