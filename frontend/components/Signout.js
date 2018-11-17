import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { SIGNOUT_MUTATION, CURRENT_USER_QUERY } from './helpers/queries'

const Signout = () => (
  <Mutation
    mutation={SIGNOUT_MUTATION}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {signout => <button onClick={signout}>Sign Out</button>}
  </Mutation>
)

export default Signout
