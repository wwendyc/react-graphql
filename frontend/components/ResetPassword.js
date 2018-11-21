import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import Proptypes from 'prop-types'

import { RESET_PASSWORD_MUTATION, CURRENT_USER_QUERY } from './helpers/queries'
import Form from './styles/Form'
import Error from './ErrorMessage'

class ResetPassword extends Component {
  static propTypes = {
    resetToken: Proptypes.string.isRequired
  }

  state = {
    password: '',
    confirmPassword: ''
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { password, confirmPassword } = this.state
    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password,
          confirmPassword
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault()
              await reset()

              this.setState({
                password: '',
                confirmPassword: ''
              })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your password</h2>
              <Error error={error} />
              {!error && !loading && called && <p>Password successfully reset!</p>}
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  value={confirmPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Reset password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default ResetPassword
