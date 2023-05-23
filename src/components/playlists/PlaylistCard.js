import React, { forwardRef, useState, useEffect } from 'react'
import { Like } from '@styled-icons/boxicons-regular/Like'
import { Dislike } from '@styled-icons/boxicons-regular/Dislike'
import { Like as LikeSolid } from '@styled-icons/boxicons-solid/Like'
import { Dislike as DislikeSolid } from '@styled-icons/boxicons-solid/Dislike'
import { ChevronsDown } from '@styled-icons/boxicons-regular/ChevronsDown'
import { ChevronsUp } from '@styled-icons/boxicons-regular/ChevronsUp'
import { UnmountClosed } from 'react-collapse'
import PlaylistSongs from './PlaylistSongs'
import PlaylistEditor from './PlaylistEditor'
import { DeletePlaylistModal, ErrorModal } from '../modals'
import { gql } from 'graphql-request'
import { useMutation, useQueryClient } from 'react-query'
import { useGlobalStore } from '../../store'

const ChangePlaylistNameMutation = gql`
    mutation changePlaylistName($id: ID!, $name: String!) {
        updatePlaylist(
            id: $id
            playlistInput: { name: $name, published: false }
        ) {
            _id
        }
    }
`

const SetReactionMutation = gql`
    mutation setReaction($id: ID!, $reaction: ReactionType) {
        setReaction(reactionInput: { playlistId: $id, type: $reaction })
    }
`

const DeletePlaylistMutation = gql`
    mutation deletePlaylist($id: ID!) {
        deletePlaylist(id: $id)
    }
`

const DuplicatePlaylistMutation = gql`
    mutation duplicatePlaylist($id: ID!) {
        duplicatePlaylist(playlistId: $id) {
            _id
        }
    }
`

const PlaylistCard = forwardRef((props, ref) => {
    // Get the playlist from the props
    const { playlist } = props

    // Clear the temp name when the playlist changes
    useEffect(() => {
        setTempName('')
    }, [playlist])

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the query client from React Query
    const queryClient = useQueryClient()

    // Define mutation to change playlist name
    const [errorMsg, setErrorMsg] = useState('')
    const { mutate: mutateName } = useMutation(
        async (newName) => {
            const { updatePlaylist } = await gqlClient.request(ChangePlaylistNameMutation, {
                id: playlist._id,
                name: newName,
            })
            return updatePlaylist
        },
        {
            onSuccess: (data) => {
                // Set the new playlist ID in the store
                setNewPlaylistId(data._id)
                // Invalidate the playlists query to update the cache
                queryClient.invalidateQueries('playlists')
                // Invalidate the player query for this playlist
                queryClient.invalidateQueries(['player', playlist._id])
            },
            onError: (error) => {
                setTempName('')
                setErrorMsg(error.response.errors[0].message)
            },
        },
    )

    // Define mutation to set reaction
    const { mutate: mutateReaction } = useMutation(
        async (reaction) => {
            await gqlClient.request(SetReactionMutation, {
                id: playlist._id,
                reaction,
            })
        },
        {
            onSuccess: () => {
                // Invalidate playlist queries
                queryClient.invalidateQueries('playlists')
            },
            onError: (error) => {
                setErrorMsg(error.response.errors[0].message)
            },
        },
    )

    // Define mutation to delete playlist
    const { mutate: mutateDelete } = useMutation(
        async () => {
            await gqlClient.request(DeletePlaylistMutation, {
                id: playlist._id,
            })
        },
        {
            onSuccess: () => {
                // Invalidate playlist queries
                queryClient.invalidateQueries('playlists')

                // If the playlist is the selected playlist, clear the selected playlist
                if (playlist._id === selectedPlaylist._id) {
                    setSelectedPlaylist(null)
                }
            },
        },
    )

    // Define mutation to duplicate playlist
    const setNewPlaylistId = useGlobalStore((state) => state.setNewPlaylistId)
    const { mutate: mutateDuplicate } = useMutation(
        async () => {
            const { duplicatePlaylist } = await gqlClient.request(DuplicatePlaylistMutation, {
                id: playlist._id,
            })
            return duplicatePlaylist
        },
        {
            onSuccess: (data) => {
                // Set the new playlist ID in the store
                setNewPlaylistId(data._id)
                // Set the current page to the home page
                setCurrentPage('home')
                // Invalidate playlist queries
                queryClient.invalidateQueries('playlists')
            },
            onError: (error) => {
                setErrorMsg(error.response.errors[0].message)
            }
        },
    )

    // Get the current expanded playlist and expanded playlist setter from the store
    const expandedPlaylist = useGlobalStore((state) => state.expandedPlaylist)
    const setExpandedPlaylist = useGlobalStore(
        (state) => state.setExpandedPlaylist,
    )

    // Determine if this playlist is expanded
    const isExpanded = expandedPlaylist == playlist._id

    // Get the selected playlist and selected playlist setter from the store
    const selectedPlaylist = useGlobalStore((state) => state.selectedPlaylist)
    const setSelectedPlaylist = useGlobalStore(
        (state) => state.setSelectedPlaylist,
    )

    // Determine if this playlist is selected
    const isSelected = selectedPlaylist?._id == playlist._id

    // Get the current user from the store
    const currentUser = useGlobalStore((state) => state.currentUser)

    // Determine if the playlist is owned by the current user
    const isOwnedByCurrentUser = playlist.author._id === currentUser?._id

    // Determine if the playlist is published
    const isPublished = playlist.published

    // Handle click to select the playlist
    const handleClick = (e) => {
        e.stopPropagation()
        // If the playlist is not selected, select it
        if (!isSelected) {
            setSelectedPlaylist({
                _id: playlist._id,
                published: playlist.published,
                selectedSong: null,
            })
        }
    }

    // Handle double click to edit
    const [isEditingName, setIsEditingName] = useState(false)
    const handleDoubleClick = () => {
        // Check if the playlist is owned by the current user and is not published
        if (isOwnedByCurrentUser && !isPublished) {
            // Toggle the editing state
            setIsEditingName(!isEditingName)
        }
    }

    // Handle name change submit
    const [tempName, setTempName] = useState('')
    const handleNameSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newName = formData.get('name')
        setTempName(newName)
        mutateName(newName)
        setIsEditingName(false)
    }

    // Handle close of error modal
    const handleErrorModalClose = () => {
        setErrorMsg('')
    }

    // Handle like click
    const handleLikeClick = (e) => {
        // Prevent the playlist from being selected
        e.stopPropagation()
        // Check if the current user has already liked the playlist
        if (playlist.myReaction === 'LIKE') {
            // Remove the like
            mutateReaction(null)
        } else {
            // Add the like
            mutateReaction('LIKE')
        }
    }

    // Handle dislike click
    const handleDislikeClick = (e) => {
        // Prevent the playlist from being selected
        e.stopPropagation()
        // Check if the current user has already disliked the playlist
        if (playlist.myReaction === 'DISLIKE') {
            // Remove the dislike
            mutateReaction(null)
        } else {
            // Add the dislike
            mutateReaction('DISLIKE')
        }
    }

    // Handle author click (search for user's playlists)
    const setCurrentPage = useGlobalStore((state) => state.setCurrentPage)
    const setSearchQuery = useGlobalStore((state) => state.setSearchQuery)
    const handleAuthorClick = (e) => {
        // Prevent the playlist from being selected
        e.stopPropagation()
        // Change the current page to the user page
        setCurrentPage('user')
        // Set the search query to the author's username
        setSearchQuery(playlist.author.userName)
    }

    // Handle delete (show modal)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const handleDelete = (e) => {
        // Prevent the playlist from being selected
        e.stopPropagation()
        // Show delete modal
        setShowDeleteModal(true)
    }
    const handleDeleteModalClose = () => {
        // Hide delete modal
        setShowDeleteModal(false)
    }

    return (
        <>
            <div
                className={
                    'card w-full shadow-xl bg-base-100' +
                    (isSelected ? ' border-4 border-secondary-focus' : '')
                }
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                ref={ref}
            >
                <div className='card-body space-y-0'>
                    <div className='flex w-full justify-between'>
                        <div>
                            {isEditingName ? (
                                <form onSubmit={handleNameSubmit}>
                                    <input
                                        className='input w-64'
                                        type='text'
                                        name='name'
                                        defaultValue={playlist.name}
                                        autoFocus
                                        onBlur={() => setIsEditingName(false)}
                                    />
                                </form>
                            ) : (
                                <p className='card-title'>{tempName ? tempName : playlist.name}</p>
                            )}
                            <div className='card-subtitle text-gray-500'>
                                <span>By: </span>
                                <a
                                    className='link link-secondary'
                                    onClick={handleAuthorClick}
                                >
                                    {playlist.author.userName}
                                </a>
                            </div>
                        </div>
                        {isPublished && (
                            <div className='flex space-x-2'>
                                <button
                                    className='btn btn-circle btn-ghost flex space-x-1'
                                    onClick={handleLikeClick}
                                >
                                    {playlist.myReaction === 'LIKE' ? (
                                        <LikeSolid size='1.5em' />
                                    ) : (
                                        <Like size='1.5em' />
                                    )}
                                    <span>{playlist.likes}</span>
                                </button>
                                <button
                                    className='btn btn-circle btn-ghost flex space-x-1'
                                    onClick={handleDislikeClick}
                                >
                                    {playlist.myReaction === 'DISLIKE' ? (
                                        <DislikeSolid size='1.5em' />
                                    ) : (
                                        <Dislike size='1.5em' />
                                    )}
                                    <span>{playlist.dislikes}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div
                        onClick={(e) => {
                            // Prevent the playlist from being selected
                            e.stopPropagation()
                        }}
                        onDoubleClick={(e) => {
                            // Prevent the playlist from being edited
                            e.stopPropagation()
                        }}
                    >
                        <UnmountClosed isOpened={isExpanded}>
                            {isOwnedByCurrentUser && !isPublished ? (
                                <PlaylistEditor
                                    id={playlist._id}
                                    handleDelete={handleDelete}
                                    handleDuplicate={mutateDuplicate}
                                />
                            ) : (
                                <PlaylistSongs
                                    id={playlist._id}
                                    handleDelete={handleDelete}
                                    handleDuplicate={mutateDuplicate}
                                    isOwnedByCurrentUser={isOwnedByCurrentUser}
                                />
                            )}
                        </UnmountClosed>
                    </div>
                    <div className='flex w-full justify-between items-center'>
                        {isPublished ? (
                            <>
                                <div>
                                    Published:{' '}
                                    <span className='text-secondary'>
                                        {new Date(
                                            Number(playlist.publishedAt),
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    Listens:{' '}
                                    <span className='text-accent'>
                                        {playlist.listens}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div />
                                <div />
                            </>
                        )}
                        {isExpanded ? (
                            <button
                                className='btn btn-circle'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedPlaylist(null)
                                }}
                            >
                                <ChevronsUp size='1.5em' />
                            </button>
                        ) : (
                            <button
                                className='btn btn-circle'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedPlaylist(playlist._id)
                                }}
                            >
                                <ChevronsDown size='1.5em' />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {errorMsg && (
                <ErrorModal message={errorMsg} close={handleErrorModalClose} />
            )}
            {showDeleteModal && (
                <DeletePlaylistModal
                    submit={mutateDelete}
                    close={handleDeleteModalClose}
                    playlist={playlist}
                />
            )}
        </>
    )
})
PlaylistCard.displayName = 'PlaylistCard'

export default PlaylistCard
