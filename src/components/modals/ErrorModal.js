import React, { useEffect } from 'react'
import { Error } from '@styled-icons/boxicons-solid/Error'
import { useGlobalStore } from '../../store'

function ErrorModal(props) {
    // Get the error message from the props
    const { message } = props

    // Get the callback for closing the modal from the props
    const { close } = props

    // Get the modal state setter from the global store
    const setModalOpen = useGlobalStore((state) => state.setModalOpen)

    // Use effect to set the modal state on open and close
    useEffect(() => {
        setModalOpen(true)
        return () => setModalOpen(false)
    }, [])

    // Return the error message in a modal
    return (
        <div className="modal modal-open" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box">
                <div className="alert bg-base-100">
                    <div>
                        <Error className="h-6 text-error" />
                        <span>{message}</span>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={close}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ErrorModal
