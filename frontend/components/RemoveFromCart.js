import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import {
  REMOVE_FROM_CART_MUTATION,
  CURRENT_USER_QUERY
} from './helpers/queries'

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }

  update = (cache, payload) => {
    // 1. read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
    // 2. remove item from the cart
    const cartItemId = payload.data.removeFromCart.id
    data.currentUser.cart = data.currentUser.cart.filter(
      cartItem => cartItem.id !== cartItemId
    )
    // 3. write it back to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => alert(err.message))
            }}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    )
  }
}

export default RemoveFromCart
