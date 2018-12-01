import React, { Component } from 'react'
import { Query } from 'react-apollo'
import propTypes from 'prop-types'

import { ALL_USERS_QUERY } from './helpers/queries'
import Table from './styles/Table'
import SickButton from './styles/SickButton'
import Error from './ErrorMessage'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
]

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserPermissions user={user} key={user.email} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
)

class UserPermissions extends Component {
  static propType = {
    user: propTypes.shape({
      name: propTypes.string,
      email: propTypes.string,
      id: propTypes.string,
      permissions: propTypes.array
    }).isRequired
  }
  state = {
    permissions: this.props.user.permissions
  }
  handleChange = e => {
    const checkbox = e.target
    // take a copy of the current permissions
    let updatedPermissions = [...this.state.permissions]
    // determine whether to add or remove target permission
    if (checkbox.checked) updatedPermissions.push(checkbox.value)
    else if (!checkbox.checked)
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      )
    this.setState({ permissions: updatedPermissions })
  }
  render() {
    const user = this.props.user
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                id={`${user.id}-permission-${permission}`}
                type="checkbox"
                checked={this.state.permissions.includes(permission)}
                value={permission}
                onChange={this.handleChange}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    )
  }
}

export default Permissions
