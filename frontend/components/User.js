import { Query } from 'react-apollo'
import PropTypes from 'prop-types'
import { propType } from 'graphql-anywhere'

import { CURRENT_USER_QUERY } from './helpers/queries'

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
)

User.PropTypes = {
  children: PropTypes.func.isRequired
}

export default User
