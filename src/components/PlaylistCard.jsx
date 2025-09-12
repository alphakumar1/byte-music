import React from 'react'

export default function PlaylistCard({ playlist, songs, onOpen, playSong }) {
  // cover priority: user cover > first song cover > default gradient
  const firstSongCover = songs.find(s => playlist.songIds.includes(s.id))?.cover
  const cover = playlist.cover || firstSongCover || null

  return (
    <div className="playlist-card" onClick={onOpen} role="button" tabIndex={0}>
      <div className="playlist-cover">
        {cover ? (
          <img src={cover} alt={`${playlist.name} cover`} />
        ) : (
          <div className="cover-gradient" />
        )}
        <button
          className="play-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (playlist.songIds.length) playSong(playlist.songIds[0])
          }}
        >
          ▶
        </button>
      </div>
      <div className="playlist-name">{playlist.name}</div>
    </div>
  )
}
