import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import RemoveFromCart from './RemoveFromCart'

import formatMoney from '../lib/formatMoney'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  h5 {
    margin: 0;
  }
`

const CartItem = ({ cartItem }) => {
  const {
    item: { image, title, price }
  } = cartItem
  return (
    <CartItemStyles>
      <img width="100" src={image} alt={title} />
      <div className="cart-item-details">
        <h3>{title}</h3>
        <div>
          <h5>
            {formatMoney(price)} &times; {cartItem.quantity}
          </h5>
          <h5>TOTAL: {formatMoney(price * cartItem.quantity)}</h5>
        </div>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  )
}

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
}

export default CartItem
