import mongoose from 'mongoose'

// Define the reaction schema (for likes and dislikes)
const reactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        playlist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Playlist',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Export the model
export default mongoose.model('Reaction', reactionSchema)
