import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { SIGNUP_MUTATION, CURRENT_USER_QUERY } from './helpers/queries'
import Form from './styles/Form'
import Error from './ErrorMessage'

class Signup extends Component {
  state = {
    name: '',
    email: '',
    password: ''
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault()
              await signup()

              this.setState({
                name: '',
                email: '',
                password: ''
              })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign up for an account!</h2>
              <Error error={error} />
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="name"
                  value={this.state.name}
                  onChange={this.saveToState}
                />
              </label>
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
              <button type="submit">Sign Up</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signup
