// src/components/PlaylistsTab.jsx
import React, { useState } from 'react'
import PlaylistCard from './PlaylistCard'
import { FiArrowLeft, FiPlay, FiPlus, FiX } from 'react-icons/fi'
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd'

export default function PlaylistsTab({
  playlists,
  songs,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  moveSongBetweenPlaylists,
  playSong,
  setPlaylists
}) {
  const [selected, setSelected] = useState(null)
  const [newName, setNewName] = useState('')
  const [addingSong, setAddingSong] = useState(false)

  const getPlaylistSongs = (pl) =>
    songs.filter((s) => pl.songIds.includes(s.id))

  // handle drag end inside playlist
  const onDragEnd = (result, plId) => {
    if (!result.destination) return
    const sourceIndex = result.source.index
    const destIndex = result.destination.index
    if (sourceIndex === destIndex) return

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== plId) return pl
        const newIds = [...pl.songIds]
        const [moved] = newIds.splice(sourceIndex, 1)
        newIds.splice(destIndex, 0, moved)
        return { ...pl, songIds: newIds }
      })
    )
  }

  if (selected) {
    const pl = playlists.find((p) => p.id === selected)
    if (!pl) {
      setSelected(null)
      return null
    }
    const plSongs = getPlaylistSongs(pl)

    return (
      <div className="playlist-detail">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={() => setSelected(null)}>
            <FiArrowLeft /> Back
          </button>
          <div className="detail-info">
            <div className="detail-cover">
              <img
                src={pl.cover || plSongs[0]?.cover || '/assets/cover1.jpg'}
                alt=""
              />
            </div>
            <div>
              <h2>{pl.name}</h2>
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap'
                }}
              >
                <button
                  className="play-btn"
                  onClick={() => {
                    if (plSongs.length) playSong(plSongs[0].id)
                  }}
                >
                  <FiPlay /> Play
                </button>
                <button
                  className="neon-btn secondary"
                  onClick={() => deletePlaylist(pl.id)}
                >
                  Delete
                </button>
                <button
                  className="neon-btn"
                  onClick={() => setAddingSong(!addingSong)}
                >
                  <FiPlus /> Add Song
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add song panel */}
        {addingSong && (
          <div className="add-song-panel">
            <h4>Select a song to add</h4>
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
        )}

        {/* Songs list with drag/drop */}
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, pl.id)}
        >
          <Droppable droppableId={`playlist-${pl.id}`}>
            {(provided) => (
              <div
                className="detail-songs"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {plSongs.length === 0 && (
                  <div className="empty">
                    No songs in this playlist
                  </div>
                )}
                {plSongs.map((song, index) => (
                  <Draggable
                    key={song.id}
                    draggableId={song.id}
                    index={index}
                  >
                    {(prov) => (
                      <div
                        className="song-strip"
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                      >
                        <img
                          src={song.cover}
                          alt=""
                          className="strip-cover"
                        />
                        <div className="strip-info">
                          <div className="strip-title">{song.title}</div>
                          <div className="strip-artist">{song.artist}</div>
                        </div>
                        <button
                          className="icon-btn"
                          onClick={() => playSong(song.id)}
                        >
                          <FiPlay />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() =>
                            removeSongFromPlaylist(song.id, pl.id)
                          }
                        >
                          <FiX />
                        </button>
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
    )
  }

  return (
    <section
      aria-label="Playlists"
      className="playlists-section"
    >
      <div className="playlists-header">
        <h2>Your Playlists</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="New playlist..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
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
          <PlaylistCard
            key={pl.id}
            playlist={pl}
            songs={songs}
            onOpen={() => setSelected(pl.id)}
            playSong={playSong}
          />
        ))}
      </div>
    </section>
  )
}
