import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import { propType } from 'graphql-anywhere'

// const CURRENT_USER_QUERY = gql`
//   currentUser {
//     id
//     email
//     name
//     permissions
//   }
// `

// const User = props => (
//   <Query {...props} query={CURRENT_USER_QUERY}>
//     {payload => props.children(payload)}
//   </Query>
// )

// User.PropTypes = {
//   children: propType.func.isRequired
// }

// export default User
// export { CURRENT_USER_QUERY }
