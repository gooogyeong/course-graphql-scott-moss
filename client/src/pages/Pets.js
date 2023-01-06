import React, { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

// fragment
const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    name
    type
    img
    vaccinated @client
    owner {
      id
      age @client 
    } 
  } 
`

const ALL_PETS = gql`
  query AllPets {
      pets {
        ...PetsFields
  } 
}
${PETS_FIELDS}
`
// add @client so that it doesn't go to server cause it's local field

const CRETE_PET = gql`
  mutation CreatePet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`

export default function Pets () {
  const [modal, setModal] = useState(false)
  // automaticall initiates APi call
  const { data, loading, error } = useQuery(ALL_PETS) // { data, loading, error }
  // createPet = actual function that runs the mutation.
  // mutation happens when you execute createPet, not useMutation
  const [createPet, newPet/* { data, loading, error } */] = useMutation(
    CRETE_PET,
    {
      update (cache, { data: { addPet } }) {
        const { pets: oldPets } = cache.readQuery({ query: ALL_PETS })
        cache.writeQuery({
          query: ALL_PETS,
          data: { pets: [addPet, ...oldPets] }
        })
      }
    })

  // if (loading || newPet.loading) return <Loader/>
  // opting out ouf loading when newPet is loading
  // cause you don't wanna use Optimistic UI AND <Loader />
  if (loading) return <Loader/>

  if (error || newPet.error) return <p>Error</p>

  const onSubmit = input => {
    setModal(false)
    createPet({
      variables: { newPet: input },
      optimisticResponse: {
        __typename: "Mutation",
        addPet: {
          __typename: "Pet",
          id: Math.floor(Math.random() * 10000) + '', // cause we don't know what id server will return
          name: input.name,
          type: input.type,
          img: 'https://via.placeholder.com/300'
          // 여기도 해줘야함
        }
      }
    })
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)}/>
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets}/>
      </section>
    </div>
  )
}
