import { useState } from 'react'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../../../store'
import { useMutation, useQuery, useQueryClient } from 'react-query'

const GetPlaylistQuery = gql`
    query GetPlaylistQuery($id: ID!) {
        playlist(id: $id) {
            _id
            name
            songs {
                _id
                title
                artist
                youTubeId
            }
            published
        }
    }
`

const UpdatePlaylistMutation = gql`
    mutation UpdatePlaylistMutation(
        $id: ID!
        $name: String!
        $songs: [SongInput!]!
        $published: Boolean!
    ) {
        updatePlaylist(
            id: $id
            playlistInput: { name: $name, songs: $songs, published: $published }
        ) {
            _id
            name
            songs {
                _id
                title
                artist
                youTubeId
            }
            published
        }
    }
`

// Define actions to update the playlist (called from a transaction)
const actionsFromTransaction = {
    createSong: (data, mutate, index, song) => {
        // Create a new array with the new song
        let newSongs = [...data.songs]
        newSongs.splice(index, 0, song)
        // Perform the mutation
        mutate({ songs: newSongs })
    },
    removeSong: (data, mutate, index) => {
        // Create a new array without the song
        const newSongs = [...data.songs]
        newSongs.splice(index, 1)
        // Perform the mutation
        mutate({ songs: newSongs })
    },
    moveSong: (data, mutate, fromIndex, toIndex) => {
        // Determine the direction of the move
        const direction = fromIndex < toIndex ? 1 : -1
        // Create a new array with the song moved
        const newSongs = [...data.songs]
        // Handle upward moves (move the song to the index of the target)
        if (direction === -1) {
            newSongs.splice(toIndex, 0, newSongs[fromIndex])
            newSongs.splice(fromIndex + 1, 1)
        } else {
            // Handle downward moves (move the song below the target index)
            newSongs.splice(toIndex + 1, 0, newSongs[fromIndex])
            newSongs.splice(fromIndex, 1)
        }
        // Perform the mutation
        mutate({ songs: newSongs })
    },
    editSong: (data, mutate, index, song) => {
        // Create a new array with the edited song
        let newSongs = [...data.songs]
        newSongs.splice(index, 1, song)
        // Perform the mutation
        mutate({ songs: newSongs })
    },
}

function useTransactions(data, mutate) {
    // Create the transaction stack
    const [transactionStack, setTransactionStack] = useState([])

    // Create the transaction stack pointer
    const [transactionPointer, setTransactionPointer] = useState(0)

    // Get the selected playlist from the store
    const selectedPlaylist = useGlobalStore((state) => state.selectedPlaylist)

    // Get the selected playlist setter from the store
    const setSelectedPlaylist = useGlobalStore(
        (state) => state.setSelectedPlaylist
    )

    // Define function to add a transaction to the stack
    const addTransaction = (transaction) => {
        // Delete transactions beyond the pointer
        const newStack = transactionStack.slice(0, transactionPointer)
        // Add the transaction to the stack
        setTransactionStack([...newStack, transaction])
        // Increment the pointer
        setTransactionPointer(transactionPointer + 1)
        // Perform the transaction
        transaction.doTransaction(data, mutate)
    }

    // Determine if we can undo and/or redo
    const canUndo = transactionPointer > 0
    const canRedo = transactionPointer < transactionStack.length

    return [
        {
            createSong: () => {
                // Use default values for a new song
                const newSong = {
                    title: 'Untitled',
                    artist: '?',
                    youTubeId: 'dQw4w9WgXcQ',
                }
                // Determine the index to insert the new song
                const index = data.songs.length
                // Create a new transaction
                const newTransaction = {
                    type: 'createSong',
                    index: index,
                    song: newSong,
                    doTransaction: (data, mutate) => {
                        actionsFromTransaction.createSong(
                            data,
                            mutate,
                            index,
                            newSong
                        )
                    },
                    undoTransaction: (data, mutate) => {
                        actionsFromTransaction.removeSong(data, mutate, index)
                    },
                }
                // Add the transaction to the stack
                addTransaction(newTransaction)
            },
            removeSong: (index) => {
                // Get the song to remove
                const song = data.songs[index]
                // Create a transaction to remove the song
                const newTransaction = {
                    type: 'removeSong',
                    index: index,
                    song: song,
                    doTransaction: (data, mutate) => {
                        actionsFromTransaction.removeSong(data, mutate, index)
                    },
                    undoTransaction: (data, mutate) => {
                        actionsFromTransaction.createSong(
                            data,
                            mutate,
                            index,
                            song
                        )
                    },
                }
                // Add the transaction to the stack
                addTransaction(newTransaction)
                // If this playlist is selected and the song was selected, set the selected song to the next song
                if (selectedPlaylist?._id === data._id) {
                    if (selectedPlaylist?.selectedSong === song._id) {
                        // If the deleted song was the last song, select the first song
                        if (index === data.songs.length - 1) {
                            setSelectedPlaylist({
                                ...selectedPlaylist,
                                selectedSong: data.songs[0]?._id,
                            })
                        } else {
                            // Otherwise, select the next song
                            setSelectedPlaylist({
                                ...selectedPlaylist,
                                selectedSong: data.songs[index + 1]?._id,
                            })
                        }
                    }
                }

            },
            moveSong: (fromIndex, toIndex) => {
                // Check that the indexes are different
                if (fromIndex !== toIndex) {
                    // Create a transaction to move the song
                    const newTransaction = {
                        type: 'moveSong',
                        fromIndex: fromIndex,
                        toIndex: toIndex,
                        doTransaction: (data, mutate) => {
                            actionsFromTransaction.moveSong(
                                data,
                                mutate,
                                fromIndex,
                                toIndex
                            )
                        },
                        undoTransaction: (data, mutate) => {
                            actionsFromTransaction.moveSong(
                                data,
                                mutate,
                                toIndex,
                                fromIndex
                            )
                        },
                    }
                    // Add the transaction to the stack
                    addTransaction(newTransaction)
                }
            },
            editSong: (index, newSong) => {
                // Get the old song
                const oldSong = data.songs[index]
                // Create a transaction to edit the song
                const newTransaction = {
                    type: 'editSong',
                    index: index,
                    oldSong: oldSong,
                    newSong: newSong,
                    doTransaction: (data, mutate) => {
                        actionsFromTransaction.editSong(
                            data,
                            mutate,
                            index,
                            newSong
                        )
                    },
                    undoTransaction: (data, mutate) => {
                        actionsFromTransaction.editSong(
                            data,
                            mutate,
                            index,
                            oldSong
                        )
                    },
                }
                // Add the transaction to the stack
                addTransaction(newTransaction)
            },
            selectSong: (index) => {
                // Get the song id
                const songId = data.songs[index]._id
                // Set the selected song
                setSelectedPlaylist({
                    _id: data._id,
                    published: false,
                    selectedSong: songId,
                })
            },
            undo: () => {
                if (transactionPointer > 0) {
                    // Get the transaction to undo
                    const transaction = transactionStack[transactionPointer - 1]
                    // Perform the undo transaction
                    transaction.undoTransaction(data, mutate)
                    // Decrement the pointer
                    setTransactionPointer(transactionPointer - 1)
                }
            },
            redo: () => {
                if (transactionPointer < transactionStack.length) {
                    // Get the transaction to redo
                    const transaction = transactionStack[transactionPointer]
                    // Perform the redo transaction
                    transaction.doTransaction(data, mutate)
                    // Increment the pointer
                    setTransactionPointer(transactionPointer + 1)
                }
            },
            publish: () => {
                // If this playlist is the selected playlist, update the store
                if (selectedPlaylist?._id === data._id) {
                    setSelectedPlaylist({
                        _id: data._id,
                        published: true,
                        selectedSong: selectedPlaylist.selectedSong,
                    })
                }
                mutate({ songs: data.songs, published: true })
            },
        },
        canUndo,
        canRedo,
    ]
}

function useEditState(id) {
    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the sort type from the store
    const currentSort = useGlobalStore((state) => state.currentSort)

    // Get the new playlist setter from the store
    const setNewPlaylistId = useGlobalStore((state) => state.setNewPlaylistId)

    // Get the query client from React Query
    const queryClient = useQueryClient()

    // Define query to get playlist
    const { data } = useQuery(['playlist_edit', id], async () => {
        const { playlist } = await gqlClient.request(GetPlaylistQuery, { id })
        return playlist
    })

    // Define mutation to update playlist
    const { mutate } = useMutation(
        async (args) => {
            const publish = args.published ? args.published : false
            const { updatePlaylist } = await gqlClient.request(
                UpdatePlaylistMutation,
                {
                    id: data._id,
                    name: data.name,
                    songs: args.songs,
                    published: publish,
                }
            )
            return updatePlaylist
        },
        {
            onSuccess: (data) => {
                // If the playlist was published, invalidate the playlists query
                if (data.published) {
                    queryClient.invalidateQueries('playlists')
                } else {
                    queryClient.setQueryData(['playlist_edit', data._id], data)
                    // If sorting by 'UPDATE_DESC', move the playlist to the top
                    if (currentSort === 'UPDATE_DESC') {
                        // Set the new playlist id (will cause the playlist to be scrolled to)
                        setNewPlaylistId(data._id)
                        queryClient.setQueryData(
                            ['playlists', 'home', currentSort, null],
                            (oldData) => {
                                // Get the index of the playlist
                                const index = oldData.findIndex(
                                    (playlist) => playlist._id === data._id
                                )
                                const updated = oldData.splice(index, 1)
                                return [updated[0], ...oldData]
                            }
                        )
                    }
                }
                // Invalidate the player for this playlist
                queryClient.invalidateQueries(['player', data._id])
            },
        }
    )

    // Create the actions
    const [actions, canUndo, canRedo] = useTransactions(data, mutate)

    return [data?.songs, actions, canUndo, canRedo]
}

export default useEditState
