import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import gql from 'graphql-tag'
import { ApolloLink } from 'apollo-link'

/**
 * Create a new apollo client and export as default
 */

// create new schema for user that has additional field 'age'
// graphql schema = type definition + resolver (func that are responsible for getting the fields in type definition)
const typeDefs = gql`
  extend type User {
    age: Int
  }
  
  extend type Pet {
    vaccinated: Boolean!
  }
`

const resolvers = {
  User: {
    age() {
      return 35
    }
  },
  Pet: {
    vaccinated() {
      return true
    }
  }
}

// intentionally make http request slow
const http = new HttpLink({ uri: 'http://localhost:4000/' })
const delay = setContext(
  request =>
    new Promise((success, fail) => {
      setTimeout(() => {
        success()
      }, 800)
    })
)

const link = ApolloLink.from([
  delay,
  http
])

// const link = new HttpLink({ uri: 'http://localhost:4000/' })
const cache = new InMemoryCache()

const client = new ApolloClient({
  link,
  cache,
  resolvers,
  typeDefs
})

export default client
