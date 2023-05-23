import mongoose from 'mongoose'

// Define the playlist schema
const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        songs: {
            type: [
                {
                    title: String,
                    artist: String,
                    youTubeId: String,
                },
            ],
            required: true,
        },
        listens: {
            type: Number,
            required: true,
        },
        published: {
            type: Boolean,
            required: true,
        },
        publishedAt: {
            type: Date,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Export the model
export default mongoose.model('Playlist', playlistSchema)
