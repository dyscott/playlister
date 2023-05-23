import React from 'react'
import PlaylistsBar from './PlaylistsBar'
import PlaylistComments from './PlaylistComments'
import PlaylistPlayer from './PlaylistPlayer'
import PlaylistCards from './PlaylistCards'

import { useGlobalStore } from '../../store'

// Component for the main Playlists view of the app
function Playlists() {
    // Get the current tab and current tab setter from the store
    const currentTab = useGlobalStore((state) => state.currentTab)
    const setCurrentTab = useGlobalStore((state) => state.setCurrentTab)

    // Define the class names for the tabs
    const playerTabClass = 'tab ' + (currentTab == 'player' ? 'tab-active' : '')
    const commentsTabClass =
        'tab ' + (currentTab == 'comments' ? 'tab-active' : '')

    // Get the selected playlist from the store
    const selectedPlaylist = useGlobalStore((state) => state.selectedPlaylist)

    return (
        <div className="h-full w-full flex flex-col">
            <PlaylistsBar />
            <div className="h-0 grow flex flex-row">
                <div className="h-full w-7/12 p-4 pr-2">
                    <PlaylistCards />
                </div>
                <div className="w-5/12 p-4 pl-2">
                    <div className="card shadow-xl bg-base-100 h-full">
                        <div className="card-body">
                            <div className="card-actions">
                                <div className="tabs tabs-boxed p-0">
                                    <a
                                        className={playerTabClass}
                                        onClick={() => {
                                            setCurrentTab('player')
                                        }}
                                    >
                                        Player
                                    </a>
                                    {selectedPlaylist?.published && (
                                    <button
                                        className={commentsTabClass}
                                        onClick={() => {
                                            setCurrentTab('comments')
                                        }}
                                    >
                                        Comments
                                    </button>
                                        )}
                                </div>
                            </div>
                            {currentTab == 'player' ? (
                                <PlaylistPlayer />
                            ) : (
                                <PlaylistComments />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Playlists
