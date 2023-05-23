import userResolvers from './userResolvers.js'
import playlistResolver from './playlistResolvers.js'
import commentResolvers from './commentResolvers.js'
import reactionResolvers from './reactionResolvers.js'

export default {
    ...userResolvers,
    ...playlistResolver,
    ...commentResolvers,
    ...reactionResolvers,
}