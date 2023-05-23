import React from 'react'
import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { useGlobalStore } from '../../store'
import { Copy } from '@styled-icons/boxicons-regular/Copy'
import { Trash } from '@styled-icons/boxicons-regular/Trash'

const PlaylistQuery = gql`
    query playlistQuery($id: ID!) {
        playlist(id: $id) {
            songs {
                _id
                title
                artist
            }
        }
    }
`

function PlaylistSongs(props) {
    // Get the playlist id, owner, and handlers from the props
    const { id, isOwnedByCurrentUser, handleDelete, handleDuplicate } = props

    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Define query to get all playlists
    const { data } = useQuery(['playlist', props.id], async () => {
        const { playlist } = await gqlClient.request(PlaylistQuery, {
            id: id,
        })
        return playlist.songs
    })

    // Define function to select a song
    const setSelectedPlaylist = useGlobalStore((state) => state.setSelectedPlaylist)
    const handleSelectSong = (song) => {
        setSelectedPlaylist({
            _id: id,
            published: true,
            selectedSong: song._id,
        })
    }

    // Get the selected song from the store
    const selectedSong = useGlobalStore((state) => state.selectedPlaylist?.selectedSong)

    return (
        <div className="card bg-primary">
            <div className="card-body p-4">
                {data?.map((song, index) => (
                    <div
                        key={song._id}
                        className={'cursor-pointer text-primary-content ' + (selectedSong === song._id ? 'font-bold' : 'font-medium')}
                        onClick={() => handleSelectSong(song)}
                    >
                        {index + 1 + ') '} {song.title} by {song.artist}
                    </div>
                ))}
                <div className="card-actions justify-end">
                    <div>
                        <button
                            className="btn btn-secondary btn-sm shadow-xl mr-1"
                            onClick={handleDuplicate}
                        >
                            <Copy size="1.5em" className="mr-2" />
                            <span>Duplicate</span>
                        </button>
                        {isOwnedByCurrentUser && (
                            <button
                                className="btn btn-secondary btn-sm shadow-xl"
                                onClick={handleDelete}
                            >
                                <Trash size="1.5em" className="mr-2" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaylistSongs
