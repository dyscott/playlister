import bcrypt from 'bcrypt'
import User from '../../models/user-model.js'
import { signToken } from '../../auth/index.js'

export default {
    // Create a new user
    createUser: async (args) => {
        // Validate password
        if (args.userInput.password !== args.userInput.passwordVerify) {
            throw new Error('Passwords do not match')
        }
        // Check password length
        if (args.userInput.password.length < 8) {
            throw new Error('Password must be at least 8 characters')
        }
        // Check if email is already in use
        const existingUser = await User.findOne({ email: args.userInput.email })
        if (existingUser) {
            throw new Error('Email is already in use')
        }
        // Check if the user's name is already in use
        const existingName = await User.findOne({
            userName: args.userInput.userName,
        })
        if (existingName) {
            throw new Error('User name is already in use')
        }

        // Create the new user and save it
        const newUser = new User(args.userInput)
        const result = await newUser.save()
        // Log the user in
        const token = signToken(result._id)
        return {
            token,
        }
    },
    // Log a user in
    login: async (args) => {
        // Get the user from the database
        // Find the user
        const user = await User.findOne({ email: args.email })
        if (!user) {
            throw new Error('User does not exist')
        }
        // Compare the password
        const passwordCorrect = await bcrypt.compare(
            args.password,
            user.password
        )
        if (!passwordCorrect) {
            throw new Error('Incorrect password')
        }
        // Generate a token and return it
        const token = signToken(user._id)
        return {
            token,
        }
    },
    // Check if a user is logged in
    loggedIn: async (args, req) => {
        // Check if the user is logged in
        if (!req.isAuth) {
            throw new Error('Not authenticated')
        }
        // Get the user from the database
        const user = await User.findById(req._id)
        if (!user) {
            throw new Error('User does not exist')
        }
        // Return the user
        return user
    },
    // Get all users
    users: async (args, req) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated')
        }
        // Get all users
        const users = await User.find()
        // Return the users
        return users.map((user) => ({
                ...user._doc,
                _id: user._id.toString(),
            }))
    },
}
