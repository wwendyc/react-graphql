import { Query } from 'react-apollo'

import { ALL_USERS_QUERY } from './helpers/queries'
import Error from './ErrorMessage'

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <p>Hey</p>
      </div>
    )}
  </Query>
)

export default Permissions
