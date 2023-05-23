import { buildSchema } from 'graphql'

export default buildSchema(`#graphql
type User {
    _id: ID!
    userName: String!
    email: String!
    firstName: String!
    lastName: String!
}
type AuthData {
    token: String!
}
type Playlist {
    _id: ID!
    name: String!
    songs: [Song!]!
    listens: Int!
    likes: Int!
    dislikes: Int!
    myReaction: ReactionType
    published: Boolean!
    publishedAt: String
    author: User!
    createdAt: String!
    updatedAt: String!
}
type Song {
    _id: ID!
    title: String!
    artist: String!
    youTubeId: String!
}
type Comment {
    _id: ID!
    content: String!
    author: User!
    playlist: Playlist!
}
type Query {
    """ Get all users """
    users: [User!]!
    """ Check if a user is authenticated """
    loggedIn: User!

    """ Get all public playlists """
    globalPlaylists(sortType: GlobalSortType!): [Playlist!]!
    """ Get all playlists for a user """
    localPlaylists(sortType: LocalSortType!): [Playlist!]!
    """ Search for playlists by user """
    searchPlaylistsByUser(user: String, sortType: GlobalSortType!): [Playlist!]!
    """ Search for playlists by name """
    searchPlaylistsByName(name: String, sortType: GlobalSortType!): [Playlist!]!

    """ Get a playlist by ID """
    playlist(id: ID!): Playlist!

    """ Get all comments for a playlist """
    comments(playlistId: ID!): [Comment!]!
}
type Mutation {
    """ Create a new user """
    createUser(userInput: UserInput): AuthData!
    """ Login a user """
    login(email: String!, password: String!): AuthData!

    """ Create a new playlist """
    createPlaylist: Playlist!
    """ Duplicate a playlist """
    duplicatePlaylist(playlistId: ID!): Playlist!
    """ Update a playlist """
    updatePlaylist(id: ID!, playlistInput: PlaylistInput): Playlist!
    """ Delete a playlist """
    deletePlaylist(id: ID!): Boolean!

    """ Create a new comment """
    createComment(commentInput: CommentInput): Comment!

    """ Set a reaction to a playlist """
    setReaction(reactionInput: ReactionInput!): ReactionType
}
enum GlobalSortType {
    NAME_ASC,
    PUB_DESC,
    LISTENS_DESC,
    LIKES_DESC,
    DISLIKES_DESC
}
enum LocalSortType {
    NAME_ASC,
    CREATE_ASC,
    UPDATE_DESC,
}
enum ReactionType {
    LIKE,
    DISLIKE
}
input UserInput {
    userName: String!
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    passwordVerify: String!
}
input PlaylistInput {
    name: String!
    songs: [SongInput!]
    published: Boolean!
}
input SongInput {
    _id: ID
    title: String!
    artist: String!
    youTubeId: String!
}
input CommentInput {
    content: String!
    playlistId: ID!
}
input ReactionInput {
    type: ReactionType
    playlistId: ID!
}
`)
