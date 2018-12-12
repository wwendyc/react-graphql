import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { ADD_TO_CART_MUTATION } from './helpers/queries'

class AddToCart extends Component {
  render() {
    const { id } = this.props
    return (
      <Mutation mutation={ADD_TO_CART_MUTATION} variables={{ id }}>
        {addToCart => <button onClick={addToCart}>Add to cart 🛒</button>}
      </Mutation>
    )
  }
}

export default AddToCart
