import React, { useRef, useState, useEffect } from 'react'
import { gql } from 'graphql-request'
import { useGlobalStore } from '../../store'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Send } from '@styled-icons/boxicons-regular/Send'
import { ErrorModal } from '../modals'

const CommentsQuery = gql`
    query CommentsQuery($playlistId: ID!) {
        comments(playlistId: $playlistId) {
            _id
            content
            author {
                _id
                userName
            }
        }
    }
`

const CreateCommentMutation = gql`
    mutation CreateCommentMutation($commentInput: CommentInput!) {
        createComment(commentInput: $commentInput) {
            _id
            content
            author {
                _id
                userName
            }
        }
    }
`

function PlaylistComments() {
    // Get the selected playlist from the store
    const selectedPlaylist = useGlobalStore((state) => state.selectedPlaylist)

    // Get the GraphQL client from the global store
    const gqlClient = useGlobalStore((state) => state.gqlClient)

    // Get the query client from React Query
    const queryClient = useQueryClient()

    // Get the current user from the store
    const currentUser = useGlobalStore((state) => state.currentUser)

    // Define logic for scrolling to the bottom of the comments
    const commentEndRef = useRef(null)
    const [scrollToBottom, setScrollToBottom] = useState(false)
    useEffect(() => {
        if (scrollToBottom) {
            commentEndRef.current.scrollIntoView({ behavior: 'smooth' })
            setScrollToBottom(false)
        }
    }, [scrollToBottom])

    // Define query to get comments for the playlist
    const { data } = useQuery(['comments', selectedPlaylist._id], async () => {
        const { comments } = await gqlClient.request(CommentsQuery, {
            playlistId: selectedPlaylist._id,
        })
        return comments
    })

    // Define mutation to create a comment
    const [errorMessage, setErrorMessage] = useState(null)
    const { mutate } = useMutation(
        async (commentContent) => {
            const { createComment } = await gqlClient.request(
                CreateCommentMutation,
                {
                    commentInput: {
                        content: commentContent,
                        playlistId: selectedPlaylist._id,
                    },
                }
            )
            return createComment
        },
        {
            onSuccess: (data) => {
                // Update the cache with the new comment
                queryClient.setQueryData(
                    ['comments', selectedPlaylist._id],
                    (oldData) => {
                        return [...oldData, data]
                    }
                )
                setScrollToBottom(true)
            },
            onError: (error) => {
                setErrorMessage(error.response.errors[0].message)
            }
        }
    )

    // Handle comment form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        const commentContent = e.target.comment.value
        mutate(commentContent)
        e.target.comment.value = ''
    }

    // Handle error modal close
    const handleClose = () => {
        setErrorMessage(null)
    }

    return (
        <>
            <div className="flex flex-col h-0 flex-grow overflow-y-scroll">
                {data?.map((comment) => (
                    <div
                        key={comment._id}
                        className={
                            'chat ' +
                            (currentUser?._id === comment.author._id
                                ? 'chat-end'
                                : 'chat-start')
                        }
                    >
                        <div className="chat-header">
                            {comment.author.userName}
                        </div>
                        <div className="chat-bubble">{comment.content}</div>
                    </div>
                ))}
                <div ref={commentEndRef} />
            </div>
            {/* Comment form */}
            <form onSubmit={handleSubmit} className="flex flex-row" autoComplete="off">
                <input
                    type="text"
                    name="comment"
                    placeholder="Comment"
                    className="input input-bordered min-w-0 flex-grow"
                />
                <button type="submit" className="btn btn-primary btn-circle ml-2">
                    <Send size="1.5em" />
                </button>
            </form>
            {errorMessage && (
                <ErrorModal message={errorMessage} close={handleClose} />
            )}
        </>
    )
}

export default PlaylistComments
