import React from 'react'
import { Query, Mutation } from 'react-apollo'

import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from './helpers/queries'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'

const Cart = () => (
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
              <p>You have __ items in your cart.</p>
            </header>

            <footer>
              <p>$11.11</p>
              <SickButton>Checkout</SickButton>
            </footer>
          </CartStyles>
        )}
      </Mutation>
    )}
  </Query>
)

export default Cart
