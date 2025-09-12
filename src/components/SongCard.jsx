// src/components/SongCard.jsx
import React, { useState } from 'react'
import { FiPlay, FiPause, FiHeart, FiPlus } from 'react-icons/fi'

const gradients = [
  'linear-gradient(135deg,#A8FF78,#78FFD6)',
  'linear-gradient(135deg,#FF9A9E,#FAD0C4)',
  'linear-gradient(135deg,#B2FEFA,#0ED2F7)',
  'linear-gradient(135deg,#FBD3E9,#BB377D)',
  'linear-gradient(135deg,#C6A6FF,#8CEAFE)',
]

export default function SongCard({
  song,
  isCurrent,
  isPlaying,
  playSong,
  togglePlay,
  addSongToPlaylist,
  playlists = [],
  toggleFavorite,
  isFavorite,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  const grad = gradients[Math.abs(hashCode(song.id)) % gradients.length]

  function hashCode(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i)
    return h
  }

  const handleAddToPlaylist = (playlistId) => {
    if (!playlistId) return
    addSongToPlaylist && addSongToPlaylist(song.id, playlistId)
    setMenuOpen(false)
  }

  return (
    <div className="card" role="listitem" tabIndex={0}>
      {/* Cover */}
      <button
        className={`cover ${isCurrent && isPlaying ? 'playing' : ''}`}
        aria-label={`Play ${song.title}`}
        onClick={() => (togglePlay ? togglePlay() : playSong())}
        style={{ borderColor: 'rgba(255,255,255,0.04)', background: grad }}
      >
        <img src={song.cover} alt={`${song.title} cover`} />
      </button>

      {/* Info */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div
          className="title"
          aria-label={song.title}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 160, // prevent overflow
            margin: '0 auto',
          }}
        >
          {song.title}
        </div>
        <div className="artist">{song.artist}</div>

        {/* Actions */}
        <div className="card-actions" style={{ justifyContent: 'center' }}>
          {/* Play/Pause */}
          <button
            className="icon-btn"
            onClick={() => (togglePlay ? togglePlay() : playSong())}
            aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
            title={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? <FiPause /> : <FiPlay />}
          </button>

          {/* Favorite */}
          <button
            className="icon-btn"
            onClick={() => toggleFavorite && toggleFavorite()}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Unfavorite' : 'Favorite'}
            style={{
              color: isFavorite ? '#ff4b6e' : 'inherit',
              transition: 'color .12s ease',
            }}
          >
            <FiHeart />
          </button>

          {/* Add to playlist */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Add to playlist"
              title="Add to playlist"
            >
              <FiPlus />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  background: 'rgba(2,6,20,0.95)',
                  padding: 10,
                  borderRadius: 8,
                  minWidth: 220,
                  zIndex: 80,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                  Add to playlist
                </div>

                {playlists.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    No playlists — create one below
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl.id)}
                      className="tab"
                      style={{ justifyContent: 'flex-start', padding: '8px 10px' }}
                      aria-label={`Add to ${pl.name}`}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>

                {/* Create playlist input */}
                <div
                  style={{
                    marginTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    paddingTop: 8,
                  }}
                >
                  <input
                    placeholder="New playlist name (Enter)"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPlaylistName.trim()) {
                        const ev = new CustomEvent('byte-create-playlist-and-add', {
                          detail: { name: newPlaylistName.trim(), songId: song.id },
                        })
                        window.dispatchEvent(ev)
                        setNewPlaylistName('')
                        setMenuOpen(false)
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.04)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text)',
                    }}
                    aria-label="Create new playlist name"
                  />
                </div>

                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  Press Enter to create & add
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
