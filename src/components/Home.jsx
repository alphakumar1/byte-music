// src/components/Home.jsx
import React, { useState } from 'react'
import SongCard from './SongCard'

/**
 * Home
 * 1) Songs grid (all songs / toggle favorites only)
 * 2) "Your Library" below with Favorites + Playlists
 */
export default function Home({
  songs,
  playlists,
  playSong,
  togglePlayPause,
  currentId,
  isPlaying,
  createPlaylist,
  addSongToPlaylist,
  toggleFavorite,
  isFavorite,
  setTab,
}) {
  const [showOnlyFavs, setShowOnlyFavs] = useState(false)

  const displayedSongs = showOnlyFavs ? songs.filter((s) => isFavorite(s.id)) : songs

  const openPlaylist = (plId) => {
    try {
      window.localStorage.setItem('bm_last_opened_playlist', plId)
    } catch {}
    setTab('playlists')
  }

  return (
    <section aria-label="Home">
      {/* Songs */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div>
            <h2 style={{ margin: '6px 0' }}>
              {showOnlyFavs ? 'Your Favorites' : 'All Songs'}
            </h2>
            <div style={{ color: 'var(--muted)' }}>
              {showOnlyFavs
                ? 'Songs you liked'
                : 'Tap a cover to play, or use controls'}
            </div>
          </div>

          <button
            className="tab"
            aria-pressed={showOnlyFavs}
            onClick={() => setShowOnlyFavs((v) => !v)}
            title={showOnlyFavs ? 'Show all songs' : 'Show only favorites'}
          >
            {showOnlyFavs ? 'Show all' : 'Show favorites'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="grid" role="list">
            {displayedSongs.length === 0 && (
              <div className="empty">No songs to show</div>
            )}
            {displayedSongs.map((s) => (
              <SongCard
                key={s.id}
                song={s}
                isCurrent={s.id === currentId}
                isPlaying={isPlaying}
                playSong={() => playSong(s.id)}
                togglePlay={() => {
                  if (s.id === currentId) togglePlayPause()
                  else playSong(s.id)
                }}
                addSongToPlaylist={addSongToPlaylist}
                playlists={playlists}
                toggleFavorite={() => toggleFavorite(s.id)}
                isFavorite={isFavorite(s.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Library */}
      <div>
        <h2 style={{ margin: '6px 0' }}>Your Library</h2>
        <div style={{ color: 'var(--muted)', marginBottom: 12 }}>
          Favorites & Playlists
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Favorites box */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open Favorites"
            onClick={() => setTab('fav')}
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') && setTab('fav')
            }
            className="playlist-mini"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
            title="Open Favorites"
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: 'linear-gradient(135deg,#ff3ecf,#39ff14,#00f6ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#000',
                fontSize: 20,
              }}
            >
              ❤
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Favorites</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {songs.filter((s) => isFavorite(s.id)).length} songs
              </div>
            </div>
          </div>

          {/* Playlists */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>Playlists</div>
              <CreatePlaylistBox createPlaylist={createPlaylist} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {playlists.length === 0 && (
                <div className="empty">No playlists yet. Create one above.</div>
              )}
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openPlaylist(pl.id)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && openPlaylist(pl.id)
                  }
                  className="playlist-mini"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    minWidth: 280,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{pl.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {pl.songIds.length} song(s)
                    </div>
                  </div>
                  <div
                    style={{
                      color: 'var(--muted)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Open →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Create playlist inline */
function CreatePlaylistBox({ createPlaylist }) {
  const [val, setVal] = useState('')

  const submit = () => {
    if (!val.trim()) return
    createPlaylist(val.trim())
    setVal('')
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        aria-label="New playlist name"
        placeholder="New playlist..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text)',
        }}
      />
      <button className="tab" onClick={submit} aria-label="Create playlist">
        Create
      </button>
    </div>
  )
}
