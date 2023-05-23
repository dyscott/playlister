import React, { useEffect } from 'react'
import { Error } from '@styled-icons/boxicons-solid/Error'
import { useGlobalStore } from '../../store'

function DeletePlaylistModal(props) {
    // Get the song to delete from the props
    const { playlist } = props

    // Get the callback for closing the modal from the props
    const { close } = props

    // Get the callback for deleting the song from the props
    const { submit } = props

    // Get the modal state setter from the global store
    const setModalOpen = useGlobalStore((state) => state.setModalOpen)

    // Use effect to set the modal state on open and close
    useEffect(() => {
        setModalOpen(true)
        return () => setModalOpen(false)
    }, [])

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        submit()
    }

    return (
        <div className="modal modal-open" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box">
                <form onSubmit={handleSubmit}>
                    <div className="alert bg-base-100">
                        <div>
                            <Error className="h-6 text-warning" />
                            <span>Are you sure you want to delete the playlist {playlist.name}?</span>
                        </div>
                    </div>
                    <div className="modal-action justify-between">
                        <button className="btn btn-primary">Delete</button>
                        <button type="button" className="btn" onClick={close}>
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DeletePlaylistModal
