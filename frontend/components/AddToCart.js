import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { ADD_TO_CART_MUTATION, CURRENT_USER_QUERY } from './helpers/queries'

class AddToCart extends Component {
  render() {
    const { id } = this.props
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading }) => (
          <button disabled={loading} onClick={addToCart}>
            Add to cart 🛒
          </button>
        )}
      </Mutation>
    )
  }
}

export default AddToCart
