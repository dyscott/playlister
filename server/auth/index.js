import dotenv from 'dotenv-flow'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config({ silent: true })
const jwtSecret = process.env.JWT_SECRET

// Sign a JWT with a given user ID
export const signToken = (_id) => jwt.sign({ _id }, jwtSecret)

export const authContext = (req) => {
    // Get the token from the request
    let token = req.headers.cookie
    // If there is no token, check the authorization header
    if (!token) {
        // Get the token from the authorization header
        token = req.headers.authorization
        // If there is no token, fail authentication
        if (!token) {
            return { isAuth: false, _id: null }
        }
        // Remove the "Bearer " prefix
        token = token.slice(7, token.length)
    } else {
        // Remove the "token=" prefix
        token = token.slice(6, token.length)
    }
    // Verify the token
    let verify
    try {
        verify = jwt.verify(token, jwtSecret)
    } catch (err) {
        return { isAuth: false, _id: null }
    }
    // If there is no user ID, fail authentication
    if (!verify._id) {
        return { isAuth: false, _id: null }
    }
    // Return the user ID and authentication status
    return { isAuth: true, _id: verify._id }
}
