import React from 'react'
import useEditState from './useEditState'
import SongCard from './SongCard'
import { Plus } from '@styled-icons/boxicons-regular/Plus'
import { Trash } from '@styled-icons/boxicons-regular/Trash'
import { Copy } from '@styled-icons/boxicons-regular/Copy'
import { Undo } from '@styled-icons/boxicons-regular/Undo'
import { Redo } from '@styled-icons/boxicons-regular/Redo'
import { Send } from '@styled-icons/boxicons-regular/Send'

function PlaylistEditor(props) {
    // Get the playlist id and handlers from the props
    const { id, handleDelete, handleDuplicate } = props

    // Use the custom hook for editor state
    const [songs, actions, canUndo, canRedo] = useEditState(id)
    return (
        <div className="card bg-primary">
            <div className="card-body p-2">
                <div className="space-y-2 flex flex-col items-center">
                    {songs?.map((song, index) => {
                        return (
                            <SongCard
                                key={song._id}
                                index={index}
                                song={song}
                                actions={actions}
                                playlistId={id}
                            />
                        )
                    })}
                    <div className="card w-64 shadow-xl bg-base-100 p-2">
                            <button
                                className="btn btn-ghost"
                                onClick={actions.createSong}
                            >
                                <Plus size="1.5em" />
                                <span>Add Song</span>
                            </button>
                    </div>
                </div>
                <div className="card-actions justify-between">
                    <div>
                        <button className="btn btn-secondary btn-sm shadow-xl mr-1" onClick={actions.undo}
                        disabled={!canUndo}>
                            <Undo size="1.5em" className="mr-2" />
                            <span>Undo</span>
                        </button>
                        <button className="btn btn-secondary btn-sm shadow-xl" onClick={actions.redo}
                        disabled={!canRedo}>
                            <Redo size="1.5em" className="mr-2"/>
                            <span>Redo</span>
                        </button>

                    </div>
                    <div>
                        <button className="btn btn-secondary btn-sm shadow-xl mr-1" onClick={actions.publish}>
                            <Send size="1.5em" className="mr-2"/>
                            <span>Publish</span>
                        </button>
                        <button className="btn btn-secondary btn-sm shadow-xl mr-1" onClick={handleDuplicate}>
                            <Copy size="1.5em" className="mr-2"/>
                            <span>Duplicate</span>
                        </button>
                        <button className="btn btn-secondary btn-sm shadow-xl" onClick={handleDelete}>
                            <Trash size="1.5em" className="mr-2"/>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaylistEditor
