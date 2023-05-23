import mongoose from 'mongoose'

// Define the comment schema
const commentSchema = new mongoose.Schema(
    {
        content: {
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
export default mongoose.model('Comment', commentSchema)
