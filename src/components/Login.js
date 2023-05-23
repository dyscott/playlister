import React, { useState } from 'react'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../store'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { ErrorModal } from './modals'

const LogInMutation = gql`
    mutation LogInMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`

function Login() {
    // Get the navigate function from React Router
    const navigate = useNavigate()

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the query client from React Query
    const queryClient = useQueryClient()

    // Define state for any potential error messages
    const [accountError, setAccountError] = useState('')

    // Define mutation to log in a user
    const { mutate } = useMutation(
        async (variables) => {
            const { login } = await gqlClient.request(LogInMutation, variables)
            return login
        },
        {
            onSuccess: (data) => {
                // Store the token to cookies
                document.cookie = `token=${data.token}; path=/`
                // Invalidate the loggedIn query
                queryClient.invalidateQueries('loggedIn')
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
        const email = formData.get('email')
        const password = formData.get('password')
        mutate({ email, password })
    }

    // Handle modal close
    const handleModalClose = () => {
        // Clear the error message
        setAccountError('')
    }

    return (
        <div className="card flex-shrink-0 max-w-sm w-full shadow-2xl bg-base-100">
            <div className="card-title justify-center pt-5">
                <h1 className="text-3xl font-bold">Login</h1>
            </div>
            <div className="card-body pt-0">
                <form onSubmit={handleSubmit}>
                    <div className="form-control mt-5">
                        <input
                            type="text"
                            name="email"
                            placeholder="email"
                            className="input input-bordered"
                        />
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
                        <button className="btn btn-primary">Login</button>
                    </div>
                </form>
                <div className="form-control mt-0">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/register')}
                    >
                        Don't have an account? Sign up!
                    </button>
                </div>
            </div>
            {accountError && (
                <ErrorModal message={accountError} close={handleModalClose} />
            )}
        </div>
    )
}

export default Login
