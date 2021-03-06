import React, { Component } from 'react'
import { Query } from 'react-apollo'
import styled from 'styled-components'

import Item from './Item'
import Pagination from './Pagination'
import { ALL_ITEMS_QUERY } from './helpers/queries'
import { perPage } from '../config'

const Center = styled.div`
  text-align: center;
`
const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`

class Items extends Component {
  render() {
    return (
      <div>
        <Center>
          <Pagination page={this.props.page} />
          <Query
            query={ALL_ITEMS_QUERY}
            // fetchPolicy="network-only"
            variables={{
              skip: this.props.page * perPage - perPage
            }}
          >
            {({ data, error, loading }) => {
              if (loading) return <p>Loading...</p>
              if (error) return <p>Error: {error.message}</p>
              return (
                <ItemsList>
                  {data.items.map(item => (
                    <Item item={item} key={item.id} />
                  ))}
                </ItemsList>
              )
            }}
          </Query>
          <Pagination page={this.props.page} />
        </Center>
      </div>
    )
  }
}

export default Items
