// src/components/MiniPlayer.jsx
import React from 'react'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiArrowLeft } from 'react-icons/fi'

export default function MiniPlayer({
  expanded,
  setExpanded,
  currentSong,
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  position,
  duration,
  seekTo,
}) {
  const percent = duration ? Math.max(0, Math.min(100, (position / duration) * 100)) : 0

  const onSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * (duration || 0))
  }

  if (!expanded) {
    // Collapsed bottom strip
    return (
      <div
        className="mini-player collapsed"
        onClick={() => setExpanded(true)}
        role="region"
        aria-label="Mini player"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          {/* Small Cover */}
          <div style={{ width: 40, height: 40, flexShrink: 0 }}>
            <img
              src={currentSong?.cover || '/assets/cover1.jpg'}
              alt={currentSong ? `${currentSong.title} cover` : 'No cover'}
              style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover' }}
            />
          </div>

          {/* Title truncated */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentSong?.title || 'Nothing playing'}
            </div>
          </div>

          {/* Play/Pause */}
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
        </div>
      </div>
    )
  }

  // Expanded full page
  return (
    <div className="mini-player expanded-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
        <button className="icon-btn" onClick={() => setExpanded(false)} aria-label="Back">
          <FiArrowLeft />
        </button>
        <div style={{ fontWeight: 700, fontSize: 16, marginLeft: 12 }}>Now Playing</div>
      </div>

      {/* Cover */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <img
          src={currentSong?.cover || '/assets/cover1.jpg'}
          alt={currentSong ? `${currentSong.title} cover` : 'No cover'}
          style={{ width: 180, height: 180, borderRadius: 12, objectFit: 'cover' }}
        />
      </div>

      {/* Title + Artist */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{currentSong?.title || 'Nothing playing'}</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>{currentSong?.artist || ''}</div>
      </div>

      {/* Progress Bar */}
      <div style={{ padding: '0 16px', marginTop: 20 }}>
        <div className="seek" onClick={onSeekClick}>
          <div className="progress" style={{ width: `${percent}%` }} />
          <div className="handle" style={{ left: `${percent}%` }} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginTop: 4,
            color: 'var(--muted)',
          }}
        >
          <span>{formatTime(position)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
        <button className="icon-btn" onClick={playPrev} aria-label="Previous">
          <FiSkipBack />
        </button>
        <button className="icon-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        <button className="icon-btn" onClick={playNext} aria-label="Next">
          <FiSkipForward />
        </button>
      </div>
    </div>
  )
}

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const s = Math.floor(t % 60).toString().padStart(2, '0')
  const m = Math.floor(t / 60)
  return `${m}:${s}`
}
