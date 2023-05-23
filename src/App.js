import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useGlobalStore } from './store'
import { gql } from 'graphql-request'
import { Login, NavBar, Playlists, Register, SplashScreen, StatusBar } from './components'

const LoggedInQuery = gql`
    query LoggedInQuery {
        loggedIn {
            _id
            firstName
            lastName
        }
    }
`

function App() {
    // Get the navigate function from React Router
    const navigate = useNavigate()

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get setters from the store
    const setCurrentUser = useGlobalStore((state) => state.setCurrentUser)

    // Everything depends on whether the user is logged in or not, so query this right away
    const { isLoading } = useQuery('loggedIn', async () => {
            try {
                // If the user is logged in, the server will return their name
                const { loggedIn } = await gqlClient.request(LoggedInQuery)
                // Set the current user
                setCurrentUser(loggedIn)
                // Send the user to the playlists page
                navigate('/playlists')
                return loggedIn
            } catch (error) {
                // The user is not logged in, set the logged in state
                setCurrentUser(null)
                return { _id: null, firstName: '', lastName: '' }
            }
        }, { refetchOnWindowFocus: false },
    )

    // If the login query is still loading, we show a loading message
    if (isLoading) {
        return <div>Loading...</div>
    }

    // Now, we can render the app
    return (
        <div className='w-full h-screen p-5 bg-base-300'>
            <div className='card h-full bg-base-100 shadow-2xl'>
                <div className='card-title'>
                    <NavBar />
                </div>
                <figure
                    className='h-full'
                    style={{
                        background:
                            'linear-gradient(45deg, hsl(var(--p)) 0%, hsl(var(--s)) 100%)',
                    }}
                >
                    <Routes>
                        <Route exact path='/' element={<SplashScreen />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/playlists' element={<Playlists />} />
                    </Routes>
                </figure>
                <div className='card-actions'>
                    <StatusBar />
                </div>
            </div>
        </div>
    )
}

export default App
