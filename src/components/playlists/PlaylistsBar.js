import React from 'react'
import { Home } from '@styled-icons/boxicons-regular/Home'
import { Group } from '@styled-icons/boxicons-regular/Group'
import { User } from '@styled-icons/boxicons-regular/User'
import { SortAlt2 } from '@styled-icons/boxicons-regular/SortAlt2'
import { useGlobalStore } from '../../store'

function PlaylistsBar() {
    // Get if the user is logged in from the store
    const currentUser = useGlobalStore((state) => state.currentUser)

    // Get the current page and current page setter from the store
    const currentPage = useGlobalStore((state) => state.currentPage)
    const setCurrentPage = useGlobalStore((state) => state.setCurrentPage)

    // Get the sort options and sort option setter from the store
    const sortOptions = useGlobalStore((state) => state.sortOptions)
    const setCurrentSort = useGlobalStore((state) => state.setCurrentSort)

    // Get the search query setter from the store
    const setSearchQuery = useGlobalStore((state) => state.setSearchQuery)

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        // Get the search query from the form
        const query = e.target.search.value
        // Set the search query in the store
        setSearchQuery(query)
    }

    return (
        <div className="navbar bg-base-100">
            <div className="navbar-start pl-2">
                {/* Buttons */}
                <button
                    className="btn btn-ghost btn-sm btn-circle mr-2"
                    onClick={() => setCurrentPage('home')}
                    disabled={!currentUser}
                >
                    <Home
                        size="1.5em"
                        className={currentPage == 'home' ? 'text-primary' : ''}
                    />
                </button>
                <button
                    className="btn btn-ghost btn-sm btn-circle mr-2"
                    onClick={() => setCurrentPage('all')}
                >
                    <Group
                        size="1.5em"
                        className={currentPage == 'all' ? 'text-primary' : ''}
                    />
                </button>
                <button
                    className="btn btn-ghost btn-sm btn-circle mr-2"
                    onClick={() => setCurrentPage('user')}
                >
                    <User
                        size="1.5em"
                        className={currentPage == 'user' ? 'text-primary' : ''}
                    />
                </button>
            </div>
            <div className="navbar-center">
                {currentPage !== 'home' && (
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search"
                            name="search"
                            className="input input-bordered"
                        />
                    </form>
                )}
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <label tabIndex="0" className="btn btn-ghost btn-rounded">
                        <span className="mr-2">Sort</span>
                        <SortAlt2 size="1.5em" />
                    </label>
                    <ul
                        tabIndex="0"
                        className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                    >
                        {sortOptions.map((option) => (
                            <li key={option.enum}>
                                <div
                                    onClick={() => {
                                        setCurrentSort(option.enum)
                                    }}
                                >
                                    {option.name}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default PlaylistsBar
