import graphqlFields from 'graphql-fields'
import Playlist from '../../models/playlist-model.js'
import Comment from '../../models/comment-model.js'

export default {
    // Get all the comments for a playlist
    comments: async (args, req, info) => {
        // Check if the playlist exists
        const playlist = await Playlist.findById(args.playlistId)
        if (!playlist) {
            throw new Error('Playlist not found')
        }
        // Get all the comments for the playlist
        let comments = await Comment.find({ playlist: args.playlistId })
        // Check if we requested author / playlist data from the info object
        const requestedFields = graphqlFields(info)
        // If we did, populate the author / playlist data
        if (requestedFields.author) {
            comments = await Comment.populate(comments, 'author')
        }
        if (requestedFields.playlist) {
            comments = await Comment.populate(comments, 'playlist')
        }
        return comments
    }, // Create a new comment
    createComment: async (args, req, info) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated, please log in to use this feature')
        }
        // Check if the playlist exists and is published
        const playlist = await Playlist.findById(args.commentInput.playlistId)
        if (!playlist) {
            throw new Error('Playlist not found')
        }
        if (!playlist.published) {
            throw new Error('Playlist not published')
        }
        // Create the comment
        const comment = new Comment({
            content: args.commentInput.content,
            author: req._id,
            playlist: args.commentInput.playlistId,
        })
        // Save the comment
        let result = await comment.save()
        // Check if we requested author / playlist data from the info object
        const requestedFields = graphqlFields(info)
        // If we did, populate the author / playlist data
        if (requestedFields.author) {
            result = await Comment.populate(result, 'author')
        }
        if (requestedFields.playlist) {
            result = await Comment.populate(result, 'playlist')
        }
        // Return the comment
        return result
    },
}
