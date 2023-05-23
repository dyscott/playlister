import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Define the user schema
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        createdPlaylists: {
            type: Number,
            default: 0,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Add hashing before save
userSchema.pre('save', async function () {
    // Check if the password has been modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
})

// Export the model
export default mongoose.model('User', userSchema)
