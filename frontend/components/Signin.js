import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { SIGNIN_MUTATION, CURRENT_USER_QUERY } from './helpers/queries'
import Form from './styles/Form'
import Error from './ErrorMessage'

class Signin extends Component {
  state = {
    email: '',
    password: ''
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[
          { query: CURRENT_USER_QUERY } // refetches query w/o refresh
        ]}
      >
        {(signin, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault()
              await signin()

              this.setState({
                email: '',
                password: ''
              })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Log in</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Log In!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin
