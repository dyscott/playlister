import React, { useEffect } from 'react'
import { useGlobalStore } from '../../store'

function EditModal(props) {
    // Get the initial values from the props
    const { song } = props

    // Get the callback for closing the modal from the props
    const { close } = props

    // Get the callback for submitting the form from the props
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
        const formData = new FormData(e.target)
        const title = formData.get('title')
        const artist = formData.get('artist')
        const youTubeId = formData.get('youTubeId')
        submit({ title, artist, youTubeId })
    }

    return (
        <div className="modal modal-open" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box">
                <form onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Title</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            className="input input-bordered"
                            defaultValue={song.title}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Artist</span>
                        </label>
                        <input
                            type="text"
                            name="artist"
                            placeholder="Artist"
                            className="input input-bordered"
                            defaultValue={song.artist}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">YouTube ID</span>
                        </label>
                        <input
                            type="text"
                            name="youTubeId"
                            placeholder="YouTube ID"
                            className="input input-bordered"
                            defaultValue={song.youTubeId}
                        />
                    </div>
                    <div className="modal-action justify-between">
                        <button className="btn btn-primary">Submit</button>
                        <button type="button" className="btn" onClick={close}>
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditModal