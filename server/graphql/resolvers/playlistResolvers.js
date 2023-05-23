import graphqlFields from 'graphql-fields'
import User from '../../models/user-model.js'
import Playlist from '../../models/playlist-model.js'
import Reaction from '../../models/reaction-model.js'
import Comment from '../../models/comment-model.js'

const populateFields = async (req, info, playlists) => {
    // Get the requested fields
    const requestedFields = graphqlFields(info)
    // Check if we requested the author
    if (requestedFields.author) {
        playlists = await Playlist.populate(playlists, 'author')
    }
    // Check if we requested myReaction
    if (requestedFields.myReaction) {
        // Check if the user is authenticated, if not, return null
        if (!req.isAuth) {
            playlists = playlists.map((playlist) => {
                playlist.myReaction = null
                return playlist
            })
        } else {
            // Get the user's reaction for each playlist
            const reactions = await Reaction.find({
                playlist: { $in: playlists.map((playlist) => playlist._id) },
                author: req._id,
            })
            // Map the reactions to the playlists
            playlists = playlists.map((playlist) => {
                const reaction = reactions.find(
                    (reaction) =>
                        reaction.playlist.toString() === playlist._id.toString()
                )
                playlist.myReaction = reaction ? reaction.type : null
                return playlist
            })
        }
    }
    // Check if we requested likes
    if (requestedFields.likes) {
        // Get the likes for each playlist
        const likes = await Reaction.find({
            playlist: { $in: playlists.map((playlist) => playlist._id) },
            type: 'LIKE',
        })
        // Map the likes to the playlists
        playlists = playlists.map((playlist) => {
            playlist.likes = likes.filter(
                (like) => like.playlist.toString() === playlist._id.toString()
            ).length
            return playlist
        })
    }
    // Check if we requested dislikes
    if (requestedFields.dislikes) {
        // Get the dislikes for each playlist
        const dislikes = await Reaction.find({
            playlist: { $in: playlists.map((playlist) => playlist._id) },
            type: 'DISLIKE',
        })
        // Map the dislikes to the playlists
        playlists = playlists.map((playlist) => {
            playlist.dislikes = dislikes.filter(
                (dislike) =>
                    dislike.playlist.toString() === playlist._id.toString()
            ).length
            return playlist
        })
    }
    // Return the playlists
    return playlists
}

const globalSortArgs = {
    NAME_ASC: { name: 1 },
    PUB_DESC: { publishedAt: -1 },
    LISTENS_DESC: { listens: -1 },
    LIKES_DESC: 'likes',
    DISLIKES_DESC: 'dislikes',
}

const localSortArgs = {
    NAME_ASC: { name: 1 },
    CREATE_ASC: { createdAt: 1 },
    UPDATE_DESC: { updatedAt: -1 },
}

export default {
    // Query for all playlists, does not require authentication
    globalPlaylists: async (args, req, info) => {
        // Get the sort type from the arguments
        const { sortType } = args
        // Get the playlists
        let playlists
        // Sort the playlists based on the sort type (if not likes or dislikes)
        if (sortType !== 'LIKES_DESC' && sortType !== 'DISLIKES_DESC') {
            playlists = await Playlist.find({
                published: true,
            }).sort(globalSortArgs[sortType])
        } else {
            playlists = await Playlist.find({
                published: true,
            })
        }
        // Populate the necessary fields
        playlists = await populateFields(req, info, playlists)
        // Perform separate sorting for likes and dislikes
        if (sortType === 'LIKES_DESC' || sortType === 'DISLIKES_DESC') {
            const sortField = globalSortArgs[sortType]
            playlists = playlists.sort((a, b) => {
                return b[sortField] - a[sortField]
            })
        }
        // Return the playlists
        return playlists
    },
    // Query for all playlists created by the current user, requires authentication
    localPlaylists: async (args, req, info) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated!')
        }
        // Get the sort type from the arguments
        const { sortType } = args
        // Sort the playlists based on the sort type
        const playlists = await Playlist.find({ author: req._id }).sort(
            localSortArgs[sortType]
        )
        // Populate the necessary fields and return the playlists
        let populatedPlaylists = await populateFields(req, info, playlists)
        return populatedPlaylists
    },
    // Search for playlists by user, does not require authentication
    searchPlaylistsByUser: async (args, req, info) => {
        // Get the user and sort type from the arguments
        const { user, sortType } = args
        // Check for empty query and return empty array
        if (user === '') {
            return []
        }
        // Search for the user in the database
        const usersFound = await User.find({userName: {'$regex': user, '$options': 'i'}})
        // Get the user IDs from the users found
        const userIds = usersFound.map((user) => user._id)
        // Get the playlists for the users found
        let playlists
        // Sort the playlists based on the sort type (if not likes or dislikes)
        if (sortType !== 'LIKES_DESC' && sortType !== 'DISLIKES_DESC') {
            playlists = await Playlist.find({
                author: { $in: userIds },
                published: true,
            }).sort(globalSortArgs[sortType])
        } else {
            playlists = await Playlist.find({
                author: { $in: userIds },
                published: true,
            })
        }
        // Populate the necessary fields
        playlists = await populateFields(req, info, playlists)
        // Perform separate sorting for likes and dislikes
        if (sortType === 'LIKES_DESC' || sortType === 'DISLIKES_DESC') {
            const sortField = globalSortArgs[sortType]
            playlists = playlists.sort((a, b) => {
                return b[sortField] - a[sortField]
            })
        }
        // Return the playlists
        return playlists
    },
    // Search for playlists by name, does not require authentication
    searchPlaylistsByName: async (args, req, info) => {
        // Get the name and sortType from the arguments
        const { name, sortType } = args
        // Check for empty query and return empty array
        if (name === '') {
            return []
        }
        // Get the playlists based on the name
        let playlists
        // Sort the playlists based on the sort type (if not likes or dislikes)
        if (sortType !== 'LIKES_DESC' && sortType !== 'DISLIKES_DESC') {
            playlists = await Playlist.find({
                name: {'$regex': name, '$options': 'i'},
                published: true,
            }).sort(globalSortArgs[sortType])
        } else {
            playlists = await Playlist.find({
                name: {'$regex': name, '$options': 'i'},
                published: true,
            })
        }
        // Populate the necessary fields
        playlists = await populateFields(req, info, playlists)
        // Perform separate sorting for likes and dislikes
        if (sortType === 'LIKES_DESC' || sortType === 'DISLIKES_DESC') {
            const sortField = globalSortArgs[sortType]
            playlists = playlists.sort((a, b) => {
                return b[sortField] - a[sortField]
            })
        }
        // Return the playlists
        return playlists
    },
    // Query for a single playlist, does not require authentication (unless the playlist is not published)
    playlist: async (args, req, info) => {
        // Get the playlist ID from the arguments
        const playlistId = args.id
        // Get the playlist from the database
        const playlist = await Playlist.findById(playlistId)
        // Check if the playlist is published
        if (!playlist.published) {
            // Check if the user is authenticated
            if (!req.isAuth) {
                throw new Error('Not authenticated!')
            }
            // Check if the user is the author of the playlist
            if (playlist.author.toString() !== req._id.toString()) {
                throw new Error('Not authorized!')
            }
        }
        // Check if we requested YouTube IDs from the info object, if so count it as a listen
        const requestedFields = graphqlFields(info)
        if (requestedFields.songs && requestedFields.songs.youTubeId) {
            // The playlist must also be published for listens to be counted
            if (playlist.published) {
                playlist.listens++
                await playlist.save()
            }
        }
        // Populate the necessary fields and return the playlist
        const populatedPlaylist = await populateFields(req, info, [playlist])
        return populatedPlaylist[0]
    },
    // Create a new playlist, requires authentication
    createPlaylist: async (args, req, info) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated!')
        }
        // Get the user from the database
        const user = await User.findById(req._id)
        // Get their created playlists count
        let { createdPlaylists } = user
        // Generate a unique name for the playlist
        let name = `Untitled ${createdPlaylists}`
        // If the name is taken (user renamed a playlist to Untitled X), find a new name
        let foundPlaylist = await Playlist.findOne({
            name,
            author: req._id,
        })
        while (foundPlaylist) {
            name = `Untitled ${++createdPlaylists}`
            foundPlaylist = await Playlist.findOne({
                name,
                author: req._id,
            })
        }
        // Create a new playlist
        const playlist = new Playlist({
            name,
            songs: [],
            listens: 0,
            likes: 0,
            dislikes: 0,
            published: false,
            publishedAt: null,
            author: req._id,
        })
        // Save the playlist to the database
        const result = await playlist.save()
        // Increment the user's created playlists count
        user.createdPlaylists = createdPlaylists + 1
        await user.save()
        // Populate the necessary fields and return the playlist
        return await populateFields(req, info, result)
    },
    // Duplicate a playlist, requires authentication
    duplicatePlaylist: async (args, req, info) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated, please log in to use this feature')
        }
        // Get the playlist ID from the arguments
        const { playlistId } = args
        // Get the playlist from the database
        const playlist = await Playlist.findById(playlistId)
        // Get the user from the database
        const user = await User.findById(req._id)
        // Check that the playlist is published or the user is the author
        if (
            !playlist.published &&
            playlist.author.toString() !== req._id.toString()
        ) {
            throw new Error('Not authorized!')
        }
        // Generate a unique name for the playlist
        let { name } = playlist
        // If the name is taken for the user, find a new name
        let foundPlaylist = await Playlist.findOne({
            name,
            author: req._id,
        })
        let i = 0
        while (foundPlaylist) {
            name = `${playlist.name} (${++i})`
            foundPlaylist = await Playlist.findOne({
                name,
                author: req._id,
            })
        }
        // Create a new playlist
        const newPlaylist = new Playlist({
            name,
            songs: playlist.songs,
            listens: 0,
            likes: 0,
            dislikes: 0,
            published: false,
            publishedAt: null,
            author: req._id,
        })
        // Save the playlist to the database
        const result = await newPlaylist.save()
        // Increment the user's created playlists count
        user.createdPlaylistsCount++
        await user.save()
        // Populate the necessary fields and return the playlist
        return await populateFields(req, info, result)
    },
    // Delete a playlist, requires authentication
    deletePlaylist: async (args, req) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated!')
        }
        // Get the playlist ID from the arguments
        const playlistId = args.id
        // Get the playlist from the database
        const playlist = await Playlist.findById(playlistId)
        // Check if the playlist exists
        if (!playlist) {
            throw new Error('Playlist not found!')
        }
        // Check if the user is the author of the playlist
        if (playlist.author.toString() !== req._id.toString()) {
            throw new Error('Not authorized!')
        }
        // Delete the playlist from the database
        const result = await Playlist.deleteOne({ _id: playlistId })
        // Delete the associated reactions
        await Reaction.deleteMany({ playlist: playlistId })
        // Delete the associated comments
        await Comment.deleteMany({ playlist: playlistId })
        // Determine if the playlist was deleted
        return result.deletedCount === 0
    },
    // Update a playlist, requires authentication
    updatePlaylist: async (args, req, info) => {
        // Check if the user is authenticated
        if (!req.isAuth) {
            throw new Error('Not authenticated!')
        }
        // Get the arguments from the request
        const playlistId = args.id
        const { name } = args.playlistInput
        const { songs } = args.playlistInput
        const { published } = args.playlistInput
        // Get the playlist from the database
        const playlist = await Playlist.findById(playlistId)
        // Check if the user is the author of the playlist
        if (playlist.author.toString() !== req._id.toString()) {
            throw new Error('Not authorized!')
        }
        // If the playlist was already published, do not allow changes
        if (playlist.published) {
            throw new Error('Playlist already published!')
        }
        // Check if the name has changed
        if (name !== playlist.name) {
            // Check if the name is taken
            const foundPlaylist = await Playlist.findOne({
                name,
                author: req._id,
            })
            if (foundPlaylist) {
                throw new Error('Playlist name already taken!')
            }
        }
        // If the playlist is published, set the publishedAt date
        let publishedAt = null
        if (published) {
            publishedAt = new Date()
        }
        // Update the playlist
        playlist.name = name
        // If songs were provided, update the songs
        if (songs) {
            playlist.songs = songs
        }
        playlist.published = published
        playlist.publishedAt = publishedAt
        // Save the playlist to the database
        const result = await playlist.save()
        // Populate the necessary fields and return the playlist
        return await populateFields(req, info, result)
    },
}
