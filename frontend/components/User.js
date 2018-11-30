import { Query } from 'react-apollo'
import propTypes from 'prop-types'
import { propType } from 'graphql-anywhere'

import { CURRENT_USER_QUERY } from './helpers/queries'

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
)

User.propTypes = {
  children: propTypes.func.isRequired
}

export default User
