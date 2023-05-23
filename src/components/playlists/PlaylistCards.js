import React, { useEffect, useRef, useState } from 'react'
import PlaylistCard from './PlaylistCard'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../../store'
import { useQuery } from 'react-query'

const localPlaylistQuery = gql`
    query localPlaylistQuery($sortType: LocalSortType!) {
        localPlaylists(sortType: $sortType) {
            _id
            name
            listens
            likes
            dislikes
            myReaction
            published
            publishedAt
            author {
                _id
                userName
            }
            createdAt
            updatedAt
        }
    }
`

const globalPlaylistQuery = gql`
    query globalPlaylistQuery($sortType: GlobalSortType!) {
        globalPlaylists(sortType: $sortType) {
            _id
            name
            listens
            likes
            dislikes
            myReaction
            published
            publishedAt
            author {
                _id
                userName
            }
            createdAt
            updatedAt
        }
    }
`

const searchPlaylistsByNameQuery = gql`
    query searchPlaylistsByNameQuery(
        $name: String!
        $sortType: GlobalSortType!
    ) {
        searchPlaylistsByName(name: $name, sortType: $sortType) {
            _id
            name
            listens
            likes
            dislikes
            myReaction
            published
            publishedAt
            author {
                _id
                userName
            }
            createdAt
            updatedAt
        }
    }
`

const searchPlaylistsByUserQuery = gql`
    query searchPlaylistsByUserQuery(
        $user: String!
        $sortType: GlobalSortType!
    ) {
        searchPlaylistsByUser(user: $user, sortType: $sortType) {
            _id
            name
            listens
            likes
            dislikes
            myReaction
            published
            publishedAt
            author {
                _id
                userName
            }
            createdAt
            updatedAt
        }
    }
`

function PlaylistCards() {
    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the current sort from the store
    const sortType = useGlobalStore((state) => state.currentSort)

    // Get the current page from the store
    const currentPage = useGlobalStore((state) => state.currentPage)

    // Get the current search query from the store
    const searchQuery = useGlobalStore((state) => state.searchQuery)

    // Get whether a modal is open from the store
    const modalOpen = useGlobalStore((state) => state.modalOpen)

    // Get the status bar message setter from the store
    const setStatusBarMessage = useGlobalStore(
        (state) => state.setStatusBarMessage
    )

    // Get the selected playlist setter from the store
    const setSelectedPlaylist = useGlobalStore(
        (state) => state.setSelectedPlaylist
    )

    // Define logic for scrolling to an added playlist
    const newPlaylistRef = useRef(null)
    const newPlaylistId = useGlobalStore((state) => state.newPlaylistId)
    const setNewPlaylistId = useGlobalStore((state) => state.setNewPlaylistId)
    const [scrollToPlaylist, setScrollToPlaylist] = useState(false)
    useEffect(() => {
        if (scrollToPlaylist && newPlaylistId) {
            newPlaylistRef.current.scrollIntoView({ behavior: 'smooth' })
            setNewPlaylistId(null)
        }
        setScrollToPlaylist(false)
    }, [scrollToPlaylist])

    // Define query to get all playlists
    const { data, isLoading } = useQuery(
        ['playlists', currentPage, sortType, searchQuery],
        async () => {
            if (currentPage === 'home') {
                // If the current page is the home page, use local query
                const { localPlaylists } = await gqlClient.request(
                    localPlaylistQuery,
                    {
                        sortType: sortType,
                    }
                )
                return localPlaylists
            } else if (currentPage === 'all') {
                // If the current page is the all page and there is a search query, use search query
                // Otherwise, use global query
                if (searchQuery !== null) {
                    const { searchPlaylistsByName } = await gqlClient.request(
                        searchPlaylistsByNameQuery,
                        {
                            name: searchQuery,
                            sortType: sortType,
                        }
                    )
                    setStatusBarMessage(`${searchQuery} Lists`)
                    return searchPlaylistsByName
                } else {
                    const { globalPlaylists } = await gqlClient.request(
                        globalPlaylistQuery,
                        {
                            sortType: sortType,
                        }
                    )
                    setStatusBarMessage('All Lists')
                    return globalPlaylists
                }
            } else if (currentPage === 'user') {
                // If the current page is the user page and there is a search query, use search query
                // Otherwise, return an empty array
                if (searchQuery !== null) {
                    const { searchPlaylistsByUser } = await gqlClient.request(
                        searchPlaylistsByUserQuery,
                        {
                            user: searchQuery,
                            sortType: sortType,
                        }
                    )
                    setStatusBarMessage(`${searchQuery}'s Lists`)
                    return searchPlaylistsByUser
                } else {
                    setStatusBarMessage('User Lists')
                    return []
                }
            } else {
                // If the current page is invalid, return an empty array
                return []
            }
        },
        {
            onSuccess: () => {
                setScrollToPlaylist(true)
            },
        }
    )

    return (
        <div
            className={'h-full space-y-4 flex flex-col pr-1 ' + (modalOpen ? 'overflow-y-hidden' : 'overflow-y-scroll')}
            onClick={() => {
                setSelectedPlaylist(null)
            }}
        >
            {!isLoading &&
                data?.map((playlist) => (
                    <PlaylistCard
                        key={playlist._id}
                        playlist={playlist}
                        ref={
                            playlist._id === newPlaylistId
                                ? newPlaylistRef
                                : null
                        }
                    />
                ))}
        </div>
    )
}

export default PlaylistCards
