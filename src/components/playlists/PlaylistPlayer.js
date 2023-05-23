import React, { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../../store'
import { useQuery } from 'react-query'
import YouTube from 'react-youtube'
import { Play } from '@styled-icons/boxicons-regular/Play'
import { Rewind } from '@styled-icons/boxicons-regular/Rewind'
import { Stop } from '@styled-icons/boxicons-regular/Stop'
import { FastForward } from '@styled-icons/boxicons-regular/FastForward'

const PlayerQuery = gql`
    query PlayerQuery($id: ID!) {
        playlist(id: $id) {
            name
            songs {
                _id
                title
                artist
                youTubeId
            }
        }
    }
`

const playerOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
        autoplay: 1,
    },
}

function PlaylistPlayer() {
    // Get the GraphQL client from the store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the selected playlist and the setter from the store
    const selectedPlaylist = useGlobalStore((state) => state.selectedPlaylist)
    const setSelectedSong = useGlobalStore(
        (state) => state.setSelectedSong
    )

    // Get the selected song from the store
    const selectedSong = useGlobalStore((state) => state.selectedPlaylist?.selectedSong)

    // Define query to get playlist songs
    const { data } = useQuery(['player', selectedPlaylist?._id], async () => {
        // Check if there is a selected playlist
        if (selectedPlaylist) {
            const { playlist } = await gqlClient.request(PlayerQuery, {
                id: selectedPlaylist._id,
            })
            // If there is no selected song, set the first song as the selected song
            if (!selectedSong) {
                setSelectedSong(playlist.songs[0]?._id)
            }
            return playlist
        } else {
            return {
                name: '',
                songs: [],
            }
        }
    })

    // Get the index and data of the selected song
    let selectedSongIndex = 0
    if (selectedSong) {
        selectedSongIndex = data?.songs.findIndex(
            (song) => song._id === selectedSong
        )
    }
    const selectedSongData = data?.songs[selectedSongIndex]

    // Use effect to update the player when the selected song changes
    useEffect(() => {
        if (player) {
            if (selectedSongData) {
                player.loadVideoById(selectedSongData.youTubeId)
            } else {
                player.loadVideoById('')
            }
        }
    }, [selectedSongData])

    // Use effect to log when selected song changes
    useEffect(() => {
        console.log('selected song changed')
    }, [selectedPlaylist])

    // Handle player ready
    const [player, setPlayer] = useState(null)
    const handlePlayerReady = (event) => {
        setPlayer(event.target)
        // Play the selected song, if there is one
        if (selectedSongData) {
            event.target.loadVideoById(selectedSongData.youTubeId)
        }
    }

    // Handle song play start
    const [playing, setPlaying] = useState(false)
    const handlePlay = () => {
        setPlaying(true)
    }

    // Handle next song
    const handleNextSong = () => {
        // Get the next song index
        let nextSongIndex = selectedSongIndex + 1
        if (nextSongIndex >= data.songs.length) {
            nextSongIndex = 0
        }
        // Set the next song as the selected song
        setSelectedSong(data.songs[nextSongIndex]._id)
        // If the index didn't change, replay the song
        if (nextSongIndex === selectedSongIndex) {
            player.playVideo()
        }
    }

    // Handle previous song
    const handlePreviousSong = () => {
        // Get the previous song index
        let previousSongIndex = selectedSongIndex - 1
        if (previousSongIndex < 0) {
            previousSongIndex = data.songs.length - 1
        }
        // Set the previous song as the selected song
        setSelectedSong(data.songs[previousSongIndex]._id)
        // If the index didn't change, replay the song
        if (previousSongIndex === selectedSongIndex) {
            player.playVideo()
        }
    }

    // Handle stop song
    const handleStopSong = () => {
        player.pauseVideo()
    }

    // Handle play song
    const handlePlaySong = () => {
        player.playVideo()
    }

    return (
        <div className="flex flex-col h-full space-y-2 justify-between">
            <div className="relative h-2/3 grow">
                <YouTube
                    opts={playerOptions}
                    className="youtube-player"
                    onReady={handlePlayerReady}
                    onEnd={handleNextSong}
                    onPlay={handlePlay}
                />
                {/* Block out the player if there is no selected playlist */}
                {(!selectedSongData || !playing) && (
                    <div className="absolute top-0 left-0 w-full h-full z-1 bg-black flex items-center justify-center">
                        <Play size="100" />
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-center">Now Playing</div>
            {selectedSongData ? (
                <div className="font-semibold">
                    <p>Playlist: {data.name}</p>
                    <p>Song #: {selectedSongIndex + 1}</p>
                    <p>Title: {selectedSongData.title}</p>
                    <p>Artist: {selectedSongData.artist}</p>
                </div>
            ) : (
                <div className="font-semibold">
                    <p>Playlist: {data?.name}</p>
                    <p>Song #: </p>
                    <p>Title: </p>
                    <p>Artist: </p>
                </div>
            )}
            <div className="card bg-primary shadow-xl">
                <div className="card-actions p-2 justify-center">
                    <button
                        className="btn btn-ghost btn-circle"
                        disabled={!selectedSongData}
                        onClick={handlePreviousSong}
                    >
                        <Rewind size="1.5em" />
                    </button>
                    <button
                        className="btn btn-ghost btn-circle"
                        disabled={!selectedSongData}
                        onClick={handleStopSong}
                    >
                        <Stop size="1.5em" />
                    </button>
                    <button
                        className="btn btn-ghost btn-circle"
                        disabled={!selectedSongData}
                        onClick={handlePlaySong}
                    >
                        <Play size="1.5em" />
                    </button>
                    <button
                        className="btn btn-ghost btn-circle"
                        disabled={!selectedSongData}
                        onClick={handleNextSong}
                    >
                        <FastForward size="1.5em" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PlaylistPlayer
