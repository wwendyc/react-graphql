import { Query } from 'react-apollo'
import { CURRENT_USER_QUERY } from './helpers/queries'
import Signin from './Signin'

const SigninPrompt = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading...</p>
      if (!data.currentUser) {
        return (
          <div>
            <p>Please sign in!</p>
            <Signin />
          </div>
        )
      }
      return props.children
    }}
  </Query>
)

export default SigninPrompt
