// src/App.jsx
import React, { useEffect, useRef, useState } from 'react'
import TopNav from './components/TopNav'
import Home from './components/Home'
import MiniPlayer from './components/MiniPlayer'
import PlaylistsTab from './components/PlaylistsTab'
import SearchBar from './components/SearchBar'
import Fav from './components/Fav'

/* helpers: localStorage wrapper */
const useLocal = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

/* sample library */
const defaultSongs = [
  {
    id: 's1',
    title: 'IK Kudi',
    artist: 'Arpit Bala',
    src: '/assets/sample1.mp3',
    cover: '/assets/cover1.jpg',
    duration: 0,
  },
  {
    id: 's2',
    title: 'Blue',
    artist: 'yung kai',
    src: '/assets/sample2.mp3',
    cover: '/assets/cover2.jpg',
    duration: 0,
  },
  {
    id: 's3',
    title: 'Haseen',
    artist: 'Talwinder',
    src: '/assets/sample3.mp3',
    cover: '/assets/cover3.jpg',
    duration: 0,
  },
]


export default function App() {
  // persisted states
  const [songs, setSongs] = useLocal('bm_songs', defaultSongs)
  const [playlists, setPlaylists] = useLocal('bm_playlists', [])
  const [queue, setQueue] = useLocal('bm_queue', [])
  const [currentId, setCurrentId] = useLocal('bm_current', null)
  const [isPlaying, setIsPlaying] = useLocal('bm_playing', false)
  const [tab, setTab] = useLocal('bm_tab', 'home')
  const [favorites, setFavorites] = useLocal('bm_favs', [])

  // transient states
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const audioRef = useRef(null)

  // helpers
  const getSong = (id) => songs.find((s) => s.id === id) || null

  const playSong = async (id, { addToQueue = true } = {}) => {
    const song = getSong(id)
    if (!song) return
    try {
      if (addToQueue) {
        setQueue((prev) => {
          const filtered = prev.filter((x) => x !== id)
          return [id, ...filtered]
        })
      }
      setCurrentId(id)
      const audio = audioRef.current
      if (!audio) return
      if (audio.src !== song.src) {
        audio.src = song.src
        try {
          audio.load()
        } catch {}
      }
      const p = audio.play()
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(true)
      }
    } catch (e) {
      console.error('playSong error', e)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentId) {
      if (songs.length) {
        await playSong(songs[0].id)
      }
      return
    }
    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        const song = getSong(currentId)
        if (song && audio.src !== song.src) {
          audio.src = song.src
          try {
            audio.load()
          } catch {}
        }
        const p = audio.play()
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
        } else {
          setIsPlaying(true)
        }
      }
    } catch (e) {
      console.error('togglePlayPause error', e)
      setIsPlaying(false)
    }
  }

  // favorites
  const isFavorite = (songId) => favorites.includes(songId)
  const toggleFavorite = (songId) => {
    setFavorites((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [songId, ...prev]
    )
  }

  // remove song globally
  const removeSong = (songId) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId))
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        songIds: pl.songIds.filter((id) => id !== songId),
      }))
    )
    setFavorites((prev) => prev.filter((id) => id !== songId))
    if (currentId === songId) {
      setCurrentId(null)
      setIsPlaying(false)
    }
  }

  // playlists
  const createPlaylist = (name) => {
    if (!name || !name.trim()) return
    const id = 'pl' + Date.now()
    setPlaylists((prev) => [{ id, name: name.trim(), songIds: [] }, ...prev])
    return id
  }

  const addSongToPlaylist = (songId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id !== playlistId || pl.songIds.includes(songId)
          ? pl
          : { ...pl, songIds: [...pl.songIds, songId] }
      )
    )
  }

  const removeSongFromPlaylist = (songId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id !== playlistId
          ? pl
          : { ...pl, songIds: pl.songIds.filter((s) => s !== songId) }
      )
    )
  }

  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
  }

  const moveSongBetweenPlaylists = (sourcePlId, destPlId, sourceIndex, destIndex) => {
    setPlaylists((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const source = copy.find((p) => p.id === sourcePlId)
      const dest = copy.find((p) => p.id === destPlId)
      if (!source || !dest) return prev
      const [moved] = source.songIds.splice(sourceIndex, 1)
      dest.songIds.splice(destIndex, 0, moved)
      return copy
    })
  }

  // queue
  const playNext = async () => {
    if (!queue.length) {
      setIsPlaying(false)
      return
    }
    const idx = queue.indexOf(currentId)
    const next = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null
    if (next) await playSong(next, { addToQueue: false })
    else setIsPlaying(false)
  }

  const playPrev = async () => {
    if (!queue.length) return
    const idx = queue.indexOf(currentId)
    const prev = idx > 0 ? queue[idx - 1] : null
    if (prev) await playSong(prev, { addToQueue: false })
  }

  // audio listeners
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setPosition(a.currentTime)
    const onLoaded = () => setDuration(a.duration || 0)
    const onEnded = () => playNext()
    const onError = () => setIsPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [queue, currentId, songs])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const song = getSong(currentId)
    if (!song) {
      a.removeAttribute('src')
      setPosition(0)
      setDuration(0)
      setIsPlaying(false)
      return
    }
    if (a.src !== song.src) {
      a.src = song.src
      try {
        a.load()
      } catch {}
    }
    if (isPlaying) {
      const p = a.play()
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(true)
      }
    }
  }, [currentId])

  const seekTo = (t) => {
    if (!audioRef.current) return
    try {
      audioRef.current.currentTime = t
      setPosition(t)
    } catch {}
  }

  // uploads
  const handleUpload = (file, imageFile) => {
    try {
      const id = 'u' + Date.now()
      const src = URL.createObjectURL(file)
      const cover = imageFile ? URL.createObjectURL(imageFile) : '/assets/cover1.jpg'
      const newSong = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Upload',
        src,
        cover,
        duration: 0,
      }
      setSongs((prev) => [newSong, ...prev])
    } catch (e) {
      console.warn('upload error', e)
    }
  }

  // tabs
  const renderTab = () => {
    if (tab === 'home') {
      return (
        <Home
          songs={songs}
          playlists={playlists}
          playSong={playSong}
          togglePlayPause={togglePlayPause}
          currentId={currentId}
          isPlaying={isPlaying}
          createPlaylist={createPlaylist}
          addSongToPlaylist={addSongToPlaylist}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          setTab={setTab}
          favorites={favorites}
          removeSong={removeSong}
        />
      )
    }
    if (tab === 'search') {
      return (
        <div>
          <SearchBar query={searchQuery} setQuery={setSearchQuery} autoFocus />
          <Home
            songs={songs.filter((s) => filterSong(s, searchQuery, playlists))}
            playlists={playlists}
            playSong={playSong}
            togglePlayPause={togglePlayPause}
            currentId={currentId}
            isPlaying={isPlaying}
            createPlaylist={createPlaylist}
            addSongToPlaylist={addSongToPlaylist}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            removeSong={removeSong}
          />
        </div>
      )
    }
    if (tab === 'playlists') {
      return (
        <PlaylistsTab
          playlists={playlists}
          songs={songs}
          createPlaylist={createPlaylist}
          addSongToPlaylist={addSongToPlaylist}
          removeSongFromPlaylist={removeSongFromPlaylist}
          deletePlaylist={deletePlaylist}
          moveSongBetweenPlaylists={moveSongBetweenPlaylists}
          playSong={playSong}
          removeSong={removeSong}
        />
      )
    }
    if (tab === 'fav') {
      return (
        <Fav
          songs={songs}
          favorites={favorites}
          playSong={playSong}
          togglePlayPause={togglePlayPause}
          isPlaying={isPlaying}
          currentId={currentId}
          toggleFavorite={toggleFavorite}
          addSongToPlaylist={addSongToPlaylist}
          playlists={playlists}
          createPlaylist={createPlaylist}
          setTab={setTab}
          removeSong={removeSong}  
        />
      )
    }
    return null
  }

  const filterSong = (song, q, playlistsLocal) => {
    if (!q || !q.trim()) return true
    const t = q.toLowerCase()
    if (song.title.toLowerCase().includes(t) || song.artist.toLowerCase().includes(t)) return true
    for (const pl of playlistsLocal) {
      if (pl.name.toLowerCase().includes(t) && pl.songIds.includes(song.id)) return true
    }
    return false
  }

  return (
    <div className="app" role="application" aria-label="Byte Music">
      <audio ref={audioRef} />
      <TopNav
        onUpload={handleUpload}
        setTab={setTab}
        currentTab={tab}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q)
          setTab('search')
        }}
      />
      <main>{renderTab()}</main>
      <MiniPlayer
        expanded={expanded}
        setExpanded={setExpanded}
        currentSong={songs.find((s) => s.id === currentId)}
        isPlaying={isPlaying}
        togglePlay={togglePlayPause}
        playNext={playNext}
        playPrev={playPrev}
        position={position}
        duration={duration}
        seekTo={seekTo}
        queueLength={queue.length}
      />
    </div>
  )
}
