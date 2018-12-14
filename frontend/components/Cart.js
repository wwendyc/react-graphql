import React from 'react'
import { Query, Mutation } from 'react-apollo'

import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from './helpers/queries'
import User from './User'
import CartItem from './CartItem'
import calcTotalItems from '../lib/calcTotalItems'
import calcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'

import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'

const Cart = () => (
  <User>
    {({ data: { currentUser } }) => {
      if (!currentUser) return null
      return (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <CartStyles open={data.cartOpen}>
                  <header>
                    <CloseButton onClick={toggleCart} title="close">
                      &times;
                    </CloseButton>
                    <Supreme>Your Cart</Supreme>
                    <p>
                      You have {calcTotalItems(currentUser.cart)} item
                      {calcTotalItems(currentUser.cart) > 1 ? 's' : ''} in your cart.
                    </p>
                  </header>
                  <ul>
                    {currentUser.cart.map(cartItem => (
                      <CartItem key={cartItem.id} cartItem={cartItem} />
                    ))}
                  </ul>
                  <footer>
                    <p>{formatMoney(calcTotalPrice(currentUser.cart))}</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              )}
            </Mutation>
          )}
        </Query>
      )
    }}
  </User>
)

export default Cart
