import mongoose from 'mongoose'
import dotenv from 'dotenv-flow'

// Load environment variables
dotenv.config({ silent: true })

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err))

// Export the mongoose connection
export default mongoose.connection
