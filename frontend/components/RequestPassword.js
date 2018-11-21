import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { REQUEST_PASSWORD_MUTATION } from './helpers/queries'
import Form from './styles/Form'
import Error from './ErrorMessage'

class RequestPassword extends Component {
  state = {
    email: '',
    password: ''
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation mutation={REQUEST_PASSWORD_MUTATION} variables={this.state}>
        {(reset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault()
              await reset()

              this.setState({
                email: ''
              })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset password</h2>
              <Error error={error} />
              {!error && !loading && called && <p>Success! Check your email for a reset link.</p>}
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
              <button type="submit">Request reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default RequestPassword
