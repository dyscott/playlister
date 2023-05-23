import React, { useState } from 'react'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../store'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { ErrorModal } from './modals'

const CreateUserMutation = gql`
    mutation CreateUserMutation(
        $userName: String!
        $email: String!
        $password: String!
        $passwordVerify: String!
        $firstName: String!
        $lastName: String!
    ) {
        createUser(
            userInput: {
                userName: $userName
                email: $email
                password: $password
                passwordVerify: $passwordVerify
                firstName: $firstName
                lastName: $lastName
            }
        ) {
            token
        }
    }
`

function Register() {
    // Get the navigate function from React Router
    const navigate = useNavigate()

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Define state for any potential error messages
    const [accountError, setAccountError] = useState('')

    // Define mutation to create a user
    const { mutate } = useMutation(
        async (variables) => {
            const { createUser } = await gqlClient.request(
                CreateUserMutation,
                variables
            )
            return createUser
        },
        {
            onSuccess: () => {
                // Navigate to the login page
                navigate('/login')
            },
            onError: (error) => {
                // Set the error message
                setAccountError(error.response.errors[0].message)
            },
        }
    )

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const userName = formData.get('userName')
        const email = formData.get('email')
        const password = formData.get('password')
        const passwordVerify = formData.get('passwordVerify')
        const firstName = formData.get('firstName')
        const lastName = formData.get('lastName')
        mutate({
            userName,
            email,
            password,
            passwordVerify,
            firstName,
            lastName,
        })
    }

    // Handle modal close
    const handleModalClose = () => {
        // Clear the error message
        setAccountError('')
    }

    return (
        <div className="card flex-shrink-0 shadow-2xl bg-base-100">
            <div className="card-title justify-center pt-5">
                <h1 className="text-3xl font-bold">Register</h1>
            </div>
            <div className="card-body pt-0">
                <form onSubmit={handleSubmit}>
                    <div className="form-control mt-5">
                        <input
                            type="text"
                            name="userName"
                            placeholder="username"
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control mt-5">
                        <input
                            type="text"
                            name="email"
                            placeholder="email"
                            className="input input-bordered"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="form-control flex-1 mt-5 mr-0 md:mr-2">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="first name"
                                className="input input-bordered"
                            />
                        </div>
                        <div className="form-control flex-1 mt-5 ml-0 md:ml-2">
                            <input
                                type="text"
                                name="lastName"
                                placeholder="last name"
                                className="input input-bordered"
                            />
                        </div>
                    </div>
                    <div className="form-control mt-5">
                        <input
                            type="password"
                            name="password"
                            placeholder="password"
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control mt-5">
                        <input
                            type="password"
                            name="passwordVerify"
                            placeholder="password verify"
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control mt-5">
                        <button className="btn btn-primary">Register</button>
                    </div>
                </form>
                <div className="form-control mt-0">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/login')}
                    >
                        Already have an account? Login
                    </button>
                </div>
            </div>
            {/* Modal for account errors */}
            {accountError && (
                <ErrorModal message={accountError} close={handleModalClose} />
            )}
        </div>
    )
}

export default Register
