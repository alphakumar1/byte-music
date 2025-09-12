// src/components/Fav.jsx
import React, { useMemo } from 'react'
import SongCard from './SongCard'

export default function Fav({
  songs = [],
  favorites = [],
  playSong = () => {},
  togglePlayPause = () => {},
  isPlaying = false,
  currentId = null,
  toggleFavorite = () => {},
  addSongToPlaylist = () => {},
  playlists = [],
  createPlaylist = () => {},
  setTab = () => {},
  removeSong = () => {}
}) {
  // derive favorite song objects safely
  const favSongs = useMemo(() => {
    if (!Array.isArray(songs) || !Array.isArray(favorites)) return []
    const favSet = new Set(favorites)
    return songs.filter((s) => favSet.has(s.id))
  }, [songs, favorites])

  const handlePlayAll = () => {
    if (!favSongs.length) return
    playSong(favSongs[0].id)
    for (let i = 1; i < favSongs.length; i++) {
      setTimeout(() => playSong(favSongs[i].id, { addToQueue: true }), i * 80)
    }
  }

  return (
    <section aria-label="Favorites">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: '6px 0' }}>Favorites</h2>
          <div style={{ color: 'var(--muted)' }}>Your favorited songs</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {favSongs.length > 0 && (
            <button className="tab" onClick={handlePlayAll} aria-label="Play all favorites">Play All</button>
          )}
          <button className="tab" onClick={() => setTab('home')} aria-label="Back to home">Home</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {favSongs.length === 0 ? (
          <div className="empty">No favorites yet — tap the ❤ on a song to add it.</div>
        ) : (
          <div className="grid" role="list">
            {favSongs.map((s) => (
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
                isFavorite={favorites.includes(s.id)}
                removeSong={removeSong}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
