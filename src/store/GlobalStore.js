import create from 'zustand'
import { GraphQLClient } from 'graphql-request'

// Define the GQL Client
const gqlClient = new GraphQLClient('/api/graphql', {
    credentials: 'include',
})

// Define sort options for global playlists
const GlobalSortTypes = [
    { name: 'Name (A-Z)', enum: 'NAME_ASC' },
    { name: 'Publish Date (New - Old)', enum: 'PUB_DESC' },
    { name: 'Listens (High - Low)', enum: 'LISTENS_DESC' },
    { name: 'Likes (High - Low)', enum: 'LIKES_DESC' },
    { name: 'Dislikes (High - Low)', enum: 'DISLIKES_DESC' },
]

// Define sort options for local playlists
const LocalSortTypes = [
    { name: 'Name (A-Z)', enum: 'NAME_ASC' },
    { name: 'Creation Date (Old - New)', enum: 'CREATE_ASC' },
    { name: 'Last Updated (New - Old)', enum: 'UPDATE_DESC' },
]

// Create the global store
const useGlobalStore = create((set, get) => ({
    // The GraphQL client
    gqlClient: gqlClient,

    // Status bar message
    statusBarMessage: '',
    setStatusBarMessage: (message) => set({ statusBarMessage: message }),

    // Current user
    currentUser: null,
    setCurrentUser: (user) => {
        set({
            currentUser: user,
        })
        get().setCurrentPage(user ? 'home' : 'all')
        get().setSelectedPlaylist(null)
    },

    // Current page in playlists view
    currentPage: 'all',
    setCurrentPage: (page) =>
        set({
            currentPage: page,
            sortOptions: page === 'home' ? LocalSortTypes : GlobalSortTypes, // Set sort options based on page
            currentSort: 'NAME_ASC', // Reset sort to default
            searchQuery: null, // Reset search query
            expandedPlaylist: null, // Reset expanded playlist
        }),

    // Set default sort options
    sortOptions: GlobalSortTypes,

    // Current sort option
    currentSort: 'NAME_ASC',
    setCurrentSort: (sort) =>
        set({
            currentSort: sort,
        }),

    // Search query
    searchQuery: null,
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Current tab (player or comments)
    currentTab: 'player',
    setCurrentTab: (tab) => set({ currentTab: tab }),

    // Current expanded playlist
    expandedPlaylist: null,
    setExpandedPlaylist: (playlist) => set({ expandedPlaylist: playlist }),

    // Current selected / playing playlist
    selectedPlaylist: null,
    setSelectedPlaylist: (playlist) => {
        const published = playlist ? playlist.published : false
        if (!published) {
            // If the playlist is not published, set the current tab to player
            get().setCurrentTab('player')
        }
        set({ selectedPlaylist: playlist })
    },
    setSelectedSong: (song) => {
        const selectedPlaylist = get().selectedPlaylist
        if (selectedPlaylist) {
            // If there is a selected playlist, set the selected song
            selectedPlaylist.selectedSong = song
            set({ selectedPlaylist: selectedPlaylist })
        }
    },
    // ID of the playlist that was just added / edited, used for scrolling to the playlist
    newPlaylistId: null,
    setNewPlaylistId: (id) => set({ newPlaylistId: id }),

    // Modal state
    modalOpen: false,
    setModalOpen: (open) => set({ modalOpen: open }),
}))

export default useGlobalStore
