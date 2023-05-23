import Playlist from '../../models/playlist-model.js'
import Reaction from '../../models/reaction-model.js'

export default {
    // Set a user's reaction to a playlist
    setReaction: async (args, req) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated, please log in to use this feature')
        }
        // Check if the playlist exists and is published
        const playlist = await Playlist.findById(args.reactionInput.playlistId)
        if (!playlist) {
            throw new Error('Playlist not found')
        }
        if (!playlist.published) {
            throw new Error('Playlist not published')
        }
        // Check if the user has already reacted to the playlist
        const existingReaction = await Reaction.findOne({
            playlist: args.reactionInput.playlistId,
            author: req._id,
        })
        if (existingReaction) {
            // Check if the reaction type is null, and if so, delete the reaction
            if (args.reactionInput.type === null) {
                await Reaction.deleteOne({
                    playlist: args.reactionInput.playlistId,
                    author: req._id,
                })
            } else {
                // Otherwise, update the reaction type
                existingReaction.type = args.reactionInput.type
                await existingReaction.save()
            }
        } else {
            // If there is no existing reaction, create a new one
            // Make sure the reaction type is not null
            if (args.reactionInput.type === null) {
                throw new Error('Reaction type cannot be null')
            } else {
                // Create a new reaction
                const reaction = new Reaction({
                    type: args.reactionInput.type,
                    playlist: args.reactionInput.playlistId,
                    author: req._id,
                })
                await reaction.save()
            }
        }
        // Return the reaction type
        return args.reactionInput.type
    },
}
