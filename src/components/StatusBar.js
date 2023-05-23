import React from 'react'
import { useGlobalStore } from '../store'
import { useLocation } from 'react-router-dom'
import { Plus } from '@styled-icons/boxicons-regular/Plus'
import { gql } from 'graphql-request'
import { useQueryClient, useMutation } from 'react-query'

const addPlaylistMutation = gql`
    mutation addPlaylist {
        createPlaylist {
            _id
        }
    }
`

function StatusBar() {
    // Get the status bar message from the store
    const message = useGlobalStore((state) => state.statusBarMessage)

    // Get the current page from the store
    const currentPage = useGlobalStore((state) => state.currentPage)

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the query client from React Query
    const queryClient = useQueryClient()

    // Get the location from React Router
    const location = useLocation()

    // Check that we are on the playlists page
    const isPlaylistsPage = location.pathname === '/playlists'

    // Get the new playlist setter from the store
    const setNewPlaylistId = useGlobalStore((state) => state.setNewPlaylistId)

    // Define mutation to add a playlist
    const { mutate } = useMutation(
        async () => {
            const { createPlaylist } = await gqlClient.request(
                addPlaylistMutation
            )
            return createPlaylist
        },
        {
            onSuccess: (data) => {
                // Invalidate all playlists queries
                queryClient.invalidateQueries('playlists')
                // Set the new playlist in the store
                setNewPlaylistId(data._id)
            },
        }
    )

    // If we are on the home page, show the add playlist button
    if (currentPage === 'home') {
        return (
            <div className="navbar justify-center">
                <button className="btn btn-wide btn-ghost" onClick={mutate}>
                    <div className="text-xl flex font-semibold space-x-2">
                        <Plus size="1.5em" />
                        <span
                            className="font-bold"
                            style={{ textTransform: 'none' }}
                        >
                            Your Lists
                        </span>
                    </div>
                </button>
            </div>
        )
    } else {
        return (
            <div className="navbar justify-center">
                <div className="text-base-content font-semibold text-xl">
                    {isPlaylistsPage && (<span className="font-bold">{message}</span>)}
                </div>
            </div>
        )
    }
}

export default StatusBar
