import React from 'react'
import { useNavigate } from 'react-router-dom'

function SplashScreen() {
    // Get the navigate function from React Router
    const navigate = useNavigate()

    return (
        <div className="h-full hero">
            <div className="hero-content flex-col lg:flex-row w-full justify-around">
                <div className="text-center text-white">
                    <h1 className="text-7xl font-bold">
                        Welcome to Playlister!
                    </h1>
                    <p className="text-2xl py-6">
                        The #1 Site for creating, sharing, and listening to
                        Playlists!
                    </p>
                </div>
                <div className="flex-shrink-0 w-80 max-w-md">
                    <div className="flex flex-col space-y-4">
                        <button
                            className="btn btn-primary h-24 shadow-xl text-xl"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                        <button
                            className="btn btn-accent h-24 shadow-xl text-xl"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </button>
                        <button
                            className="btn btn-secondary h-24 shadow-xl text-xl"
                            onClick={() => navigate('/playlists')}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SplashScreen
