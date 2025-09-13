// src/components/PlaylistsTab.jsx
import React, { useState } from 'react'
import { FiArrowLeft, FiPlus, FiTrash } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import SearchBar from './SearchBar'

/**
 * PlaylistsTab
 *
 * Props:
 *  - playlists: [{id,name,cover?,songIds:[]}, ...]
 *  - songs: array of all songs
 *  - createPlaylist(name)
 *  - addSongToPlaylist(songId, playlistId)
 *  - removeSongFromPlaylist(songId, playlistId)
 *  - deletePlaylist(playlistId)
 *  - onReorder(playlistId, newSongIds)   <-- persist reorder
 *  - playPlaylist(playlistId)            <-- play playlist from App
 */
export default function PlaylistsTab({
  playlists = [],
  songs = [],
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  onReorder,
  playPlaylist,
}) {
  const [selected, setSelected] = useState(null)
  const [newName, setNewName] = useState('')
  const [addingSong, setAddingSong] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getPlaylistSongs = (pl) =>
    songs.filter((s) => pl.songIds.includes(s.id))

  // drag end for current playlist
  const onDragEnd = (result) => {
    if (!result.destination) return
    const plId = result.source.droppableId
    const pl = playlists.find((p) => p.id === plId)
    if (!pl) return

    const src = result.source.index
    const dst = result.destination.index
    if (src === dst) return

    const newSongIds = reorder(pl.songIds, src, dst)
    if (typeof onReorder === 'function') onReorder(plId, newSongIds)
  }

  // default list view
  if (!selected) {
    return (
      <section aria-label="Playlists" className="playlists-section">
        <div className="playlists-header">
          <h2>Your Playlists</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="New playlist..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                newName.trim() &&
                (createPlaylist(newName), setNewName(''))
              }
              style={{ padding: 8, borderRadius: 8 }}
            />
            <button
              className="neon-btn"
              onClick={() => {
                if (newName.trim()) {
                  createPlaylist(newName)
                  setNewName('')
                }
              }}
            >
              Create
            </button>
          </div>
        </div>

        <div className="playlists-grid">
          {playlists.length === 0 && (
            <div className="empty">No playlists yet</div>
          )}
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(pl.id)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && setSelected(pl.id)
              }
            >
              <div className="playlist-cover">
                {pl.cover ? (
                  <img src={pl.cover} alt={pl.name} />
                ) : (
                  <div className="cover-gradient" />
                )}
              </div>

              <div style={{ padding: 12 }}>
                <div className="playlist-name">{pl.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {pl.songIds.length} songs
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // DETAIL VIEW for one playlist
  const pl = playlists.find((p) => p.id === selected)
  if (!pl) {
    setSelected(null)
    return null
  }
  const plSongs = getPlaylistSongs(pl)
  const filteredSongs = plSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="playlist-detail">
      {/* Back + title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <button className="back-btn" onClick={() => setSelected(null)}>
          <FiArrowLeft /> Back
        </button>
        <h2 style={{ margin: 0 }}>{pl.name}</h2>
      </div>

      {/* Cover + actions (play/add/delete) */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div className="detail-cover">
          <img
            src={pl.cover || plSongs[0]?.cover || '/assets/cover1.jpg'}
            alt={pl.name}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* round play button */}
          <button
            className="play-circle"
            onClick={() => playPlaylist(pl.id)}
            aria-label="Play playlist"
          >
            ▶
          </button>
          <button
            className="neon-btn"
            onClick={() => setAddingSong((v) => !v)}
          >
            <FiPlus /> Add song
          </button>
          <button
            className="neon-btn secondary"
            onClick={() => {
              deletePlaylist(pl.id)
              setSelected(null)
            }}
          >
            <FiTrash /> Delete
          </button>
        </div>
      </div>

      {/* Add song panel */}
      {addingSong && (
        <div className="add-song-panel">
          <h4>Select a song to add</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {songs.map((s) => (
              <div
                key={s.id}
                className="song-strip"
                onClick={() => {
                  addSongToPlaylist(s.id, pl.id)
                  setAddingSong(false)
                }}
              >
                <img src={s.cover} alt="" className="strip-cover" />
                <div className="strip-info">
                  <div className="strip-title">{s.title}</div>
                  <div className="strip-artist">{s.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search inside playlist */}
      <div style={{ margin: '12px 0' }}>
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      </div>

      {/* Songs with drag-and-drop */}
      <div style={{ marginTop: 12 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={pl.id}>
            {(provided) => (
              <div
                className="detail-songs"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredSongs.length === 0 && (
                  <div className="empty">No matching songs</div>
                )}
                {filteredSongs.map((song, idx) => (
                  <Draggable key={song.id} draggableId={song.id} index={idx}>
                    {(prov) => (
                      <div
                        className="song-strip"
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                      >
                        <img src={song.cover} alt="" className="strip-cover" />
                        <div className="strip-info">
                          <div className="strip-title">{song.title}</div>
                          <div className="strip-artist">{song.artist}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="icon-btn"
                            onClick={() => playPlaylist(pl.id)}
                          >
                            ▶
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() =>
                              removeSongFromPlaylist(song.id, pl.id)
                            }
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}

// reorder helper
function reorder(list = [], startIndex, endIndex) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
