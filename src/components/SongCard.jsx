// src/components/SongCard.jsx
import React, { useState } from 'react'
import { FiHeart, FiPlus, FiCheck } from 'react-icons/fi'

export default function SongCard({
  song,
  isCurrent,
  isPlaying,
  playSong,
  togglePlay,
  playlists,
  addSongToPlaylist,
  createPlaylist,   // ✅ this must be passed from parent
  toggleFavorite,
  isFavorite,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [newPlName, setNewPlName] = useState('')

  const handleCreateAndAdd = () => {
    if (!newPlName.trim()) return
    const newId = createPlaylist(newPlName.trim())
    addSongToPlaylist(song.id, newId)
    setNewPlName('')
    setMenuOpen(false)
  }

  return (
    <div className={`song-card ${isCurrent ? 'current' : ''}`}>
      {/* Cover */}
      <div
        className={`song-cover ${isCurrent && isPlaying ? 'spinning' : ''}`}
        onClick={() => {
          if (isCurrent) togglePlay()
          else playSong()
        }}
      >
        <img src={song.cover} alt={song.title} />
        {isCurrent && (
          <div className="overlay">
            {isPlaying ? '⏸' : '▶'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="song-info">
        <div className="song-title" title={song.title}>
          {song.title}
        </div>
        <div className="song-artist">{song.artist}</div>
      </div>

      {/* Actions */}
      <div className="song-actions">
        {/* Favorite */}
        <button
  className={`icon-btn heart ${isFavorite ? 'fav' : ''}`}
  onClick={toggleFavorite}
  aria-label="Favorite"
>
  <FiHeart />
</button>


        {/* Playlist dropdown */}
        <div className="playlist-menu">
          <button
            className="icon-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Add to playlist"
          >
            <FiPlus />
          </button>

          {menuOpen && (
            <div className="playlist-dropdown neon-theme">
              <div className="dropdown-section">
                <div className="dropdown-header">Add to playlist</div>
                {playlists.length === 0 && (
                  <div className="dropdown-item empty">No playlists yet</div>
                )}
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="dropdown-item"
                    onClick={() => {
                      addSongToPlaylist(song.id, pl.id)
                      setMenuOpen(false)
                    }}
                  >
                    {pl.name}
                    {pl.songIds.includes(song.id) && (
                      <FiCheck style={{ marginLeft: 'auto', opacity: 0.7 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Create playlist */}
              <div className="dropdown-section new-playlist">
                <input
                  type="text"
                  placeholder="New playlist..."
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                />
                <button className="create-btn" onClick={handleCreateAndAdd}>
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
