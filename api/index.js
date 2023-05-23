import express from 'express'
import dotenv from 'dotenv-flow'
import cors from 'cors'
import { createHandler } from 'graphql-http/lib/use/express';
import morgan from 'morgan'

import { execute } from 'graphql'
import Schema from '../server/graphql/schema/index.js'
import Resolver from '../server/graphql/resolvers/index.js'
// eslint-disable-next-line no-unused-vars
import db from '../server/db/index.js'
import { authContext } from '../server/auth/index.js'

// Load environment variables
dotenv.config({ silent: true })
const PORT = process.env.SERVER_PORT || 4000

// Create express app
const app = express()

// Use middleware
app.use(morgan('dev'))

app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: ['*'],
        credentials: true,
    })
)
app.use(express.json())

// Set up GraphQL
app.use(
    '/api/graphql',
    createHandler({
        schema: Schema,
        rootValue: Resolver,
        context: authContext,
        async customExecuteFn(args) {
            const result = await execute(args)
            if (result.errors?.[0]) {
                result.data = result.errors[0]
            }
            return result
        },
    })
)

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

export default app