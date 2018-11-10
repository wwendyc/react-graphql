import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String!
    $largeImage: String!
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
    uploadingFile: false
  }

  handleChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  uploadFile = async e => {
    console.log('uploading file...')
    this.setState({ uploadingFile: true })
    const files = e.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')

    const res = await fetch(
      '	https://api.cloudinary.com/v1_1/wendyc/image/upload',
      {
        method: 'POST',
        body: data
      }
    )
    const file = await res.json()
    console.log(file)
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
      uploadingFile: false
    })
  }

  render() {
    const {
      title,
      description,
      image,
      largeImage,
      price,
      uploadingFile
    } = this.state

    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault()
              // call the mutation
              const res = await createItem()
              // redirect to the single item page
              console.log(res)
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id }
              })
            }}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  id="file"
                  type="file"
                  name="file"
                  placeholder="Upload an image"
                  onChange={this.uploadFile}
                  required
                />
                {image && (
                  <img
                    src={image}
                    width="200"
                    alt="upload preview"
                  />
                )}
              </label>

              <label htmlFor="title">
                Title
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="title"
                  value={title}
                  onChange={this.handleChange}
                  required
                />
              </label>

              <label htmlFor="price">
                Price
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="price"
                  value={price}
                  onChange={this.handleChange}
                  required
                />
              </label>

              <label htmlFor="description">
                Description
                <input
                  id="description"
                  name="description"
                  placeholder="enter a description"
                  value={description}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <button type="submit" disabled={uploadingFile}>
                Submit
              </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
