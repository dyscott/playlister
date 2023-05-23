import React, { useState } from 'react'
import { Edit } from '@styled-icons/boxicons-solid/Edit'
import { Trash } from '@styled-icons/boxicons-regular/Trash'
import { DeleteSongModal, EditModal } from '../../modals'
import { useGlobalStore } from '../../../store'

function SongCard(props) {
    // Get index, song, actions, and playlistId from props
    const { index, song, actions } = props

    // Create state for showing edit modal
    const [showEditModal, setShowEditModal] = useState(false)

    // Create state for showing delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Get the selected song from the store
    const selectedSong = useGlobalStore((state) => state.selectedPlaylist?.selectedSong)

    // Create drag and drop handlers
    const handleDragStart = (e) => {
        e.dataTransfer.setData('index', index)
    }
    const handleDragOver = (e) => {
        e.preventDefault()
    }
    const handleDrop = (e) => {
        e.preventDefault()
        const fromIndex = parseInt(e.dataTransfer.getData('index'))
        const toIndex = index
        actions.moveSong(fromIndex, toIndex)
    }

    return (
        <>
            <div
                className="card w-full shadow-xl bg-base-100 cursor-pointer"
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => actions.selectSong(index)}
            >
                <div className="card-body w-full flex-row justify-between p-4 items-center">
                    <p className={'text-left ' + (selectedSong === song._id ? 'text-secondary font-bold' : 'font-semibold')}>
                        {index + 1 + ') ' + song.title + ' by ' + song.artist}
                    </p>
                    <div>
                        <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowEditModal(true)
                            }}
                        >
                            <Edit size="20" />
                        </button>
                        <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteModal(true)
                            }}
                        >
                            <Trash size="20" />
                        </button>
                    </div>
                </div>
            </div>
            {showEditModal && (
                <EditModal
                    song={song}
                    close={() => setShowEditModal(false)}
                    submit={(newSong) => actions.editSong(index, newSong)}
                />
            )}
            {showDeleteModal && (
                <DeleteSongModal
                    song={song}
                    close={() => setShowDeleteModal(false)}
                    submit={() => actions.removeSong(index)}
                />
            )}
        </>
    )
}

export default SongCard
