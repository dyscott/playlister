import React from 'react'
import { useGlobalStore } from '../store'
import { useLocation, useNavigate } from 'react-router-dom'
import { User } from '@styled-icons/boxicons-solid/User'
import { useQueryClient } from 'react-query'

function NavBar() {
    // Get the current user from the store
    const { currentUser } = useGlobalStore((state) => state)

    // Get the current page setter from the store
    const { setCurrentPage } = useGlobalStore((state) => state)

    // Determine if we should show the avatar based on the current route
    const location = useLocation()
    const atSplash = location.pathname === '/'
    const atLogin = location.pathname === '/login'
    const atRegister = location.pathname === '/register'
    const showAvatar = !atSplash && !atLogin && !atRegister

    // Declare handlers for the buttons
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const handleLogin = () => {
        // Navigate to the login page
        navigate('/login')
    }
    const handleRegister = () => {
        // Navigate to the register page
        navigate('/register')
    }
    const handleLogout = () => {
        // Clear the token from cookies
        document.cookie =
            'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        // Invalidate all queries
        queryClient.invalidateQueries()
        // Navigate to the home page
        navigate('/')
    }
    const handleHome = () => {
        // "Home" depends on whether the user is logged in
        if (currentUser) {
            // Navigate to the playlist page
            navigate('/playlists')
            // Set the current page to home within playlists
            setCurrentPage('home')
        } else {
            // Navigate to the splash page
            navigate('/')
        }
    }

    // Generate the avatar icon based on the logged in state
    const avatar = currentUser ? (
        <span className="text-xl text-primary-content">
            {currentUser.firstName[0] + currentUser.lastName[0]}
        </span>
    ) : (
        <User className="w-6 h-6 text-primary-content" />
    )

    // Generate a list of buttons based on the logged in state
    const buttons = currentUser
        ? [
              {
                  text: 'Logout',
                  handler: handleLogout,
              },
          ]
        : [
              {
                  text: 'Login',
                  handler: handleLogin,
              },
              {
                  text: 'Register',
                  handler: handleRegister,
              },
          ]

    return (
        <div className="navbar">
            <div className="flex-1">
                <div
                    className="btn btn-ghost normal-case text-xl"
                    onClick={handleHome}
                >
                    Playlister
                </div>
            </div>
            {showAvatar && (
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-circle avatar placeholder"
                        >
                            <div className="bg-primary text-neutral-content rounded-full w-24">
                                {avatar}
                            </div>
                        </label>
                        <ul
                            tabIndex={0}
                            className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                        >
                            {buttons.map((button) => (
                                <li key={button.text}>
                                    <div onClick={button.handler}>
                                        {button.text}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NavBar
