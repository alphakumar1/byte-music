// src/App.jsx
import React, { useEffect, useRef, useState } from 'react'
import TopNav from './components/TopNav'
import Home from './components/Home'
import MiniPlayer from './components/MiniPlayer'
import PlaylistsTab from './components/PlaylistsTab'
import SearchBar from './components/SearchBar'
import Fav from './components/Fav'

/* localStorage state helper */
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

/* default songs */
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
  const [songs, setSongs] = useLocal('bm_songs', defaultSongs)
  const [playlists, setPlaylists] = useLocal('bm_playlists', [])
  const [queue, setQueue] = useState([]) // 🔹 fresh queue (not persisted)
  const [currentId, setCurrentId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tab, setTab] = useLocal('bm_tab', 'home')
  const [favorites, setFavorites] = useLocal('bm_favs', [])

  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const audioRef = useRef(null)

  /* helpers */
  const getSong = (id) => songs.find((s) => s.id === id) || null

  /** Core play function */
  const playSong = async (id, { replaceQueue = true } = {}) => {
    const song = getSong(id)
    if (!song) return

    // 🔹 rebuild queue if needed
    if (replaceQueue) {
      const idx = songs.findIndex((s) => s.id === id)
      if (idx >= 0) {
        setQueue(songs.map((s) => s.id)) // full song order
      }
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

    try {
      await audio.play()
      setIsPlaying(true)
    } catch (e) {
      console.warn('play error', e)
      setIsPlaying(false)
    }
  }

  /** Toggle pause/resume */
  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentId) {
      if (songs.length) playSong(songs[0].id)
      return
    }
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  /** Queue navigation */
  const playNext = () => {
    if (!currentId || !queue.length) return
    const idx = queue.indexOf(currentId)
    if (idx >= 0 && idx < queue.length - 1) {
      playSong(queue[idx + 1], { replaceQueue: false })
    }
  }

  const playPrev = () => {
    if (!currentId || !queue.length) return
    const idx = queue.indexOf(currentId)
    if (idx > 0) {
      playSong(queue[idx - 1], { replaceQueue: false })
    }
  }

  /* audio events */
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
  }, [queue, currentId])

  /* seek */
  const seekTo = (t) => {
    if (!audioRef.current) return
    try {
      audioRef.current.currentTime = t
      setPosition(t)
    } catch {}
  }

  /* favorites */
  const isFavorite = (id) => favorites.includes(id)
  const toggleFavorite = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]))

  /* playlists */
  const createPlaylist = (name) => {
    if (!name || !name.trim()) return
    const id = 'pl' + Date.now()
    setPlaylists((prev) => [{ id, name: name.trim(), songIds: [] }, ...prev])
    return id
  }
  const addSongToPlaylist = (sid, pid) =>
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id !== pid || pl.songIds.includes(sid) ? pl : { ...pl, songIds: [...pl.songIds, sid] }
      )
    )
  const removeSongFromPlaylist = (sid, pid) =>
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id !== pid ? pl : { ...pl, songIds: pl.songIds.filter((s) => s !== sid) }))
    )
  const deletePlaylist = (pid) => setPlaylists((prev) => prev.filter((p) => p.id !== pid))

  /* tabs */
  const filterSong = (song, q, pls) => {
    if (!q) return true
    const t = q.toLowerCase()
    if (song.title.toLowerCase().includes(t) || song.artist.toLowerCase().includes(t)) return true
    return pls.some((pl) => pl.name.toLowerCase().includes(t) && pl.songIds.includes(song.id))
  }
  // Persist a new order for a playlist's songIds (called from PlaylistsTab on drag end)
  const reorderPlaylistSongs = (playlistId, newSongIds) => {
    setPlaylists(prev => {
      const updated = prev.map(pl => pl.id === playlistId ? { ...pl, songIds: newSongIds } : pl)
      return updated
    })

    // If the currently active queue matches the playlist (simple heuristic), update queue too
    setQueue(prevQueue => {
      // if queue contains at least one id from newSongIds AND all newSongIds are present in previous queue
      const allPresent = newSongIds.every(id => prevQueue.includes(id))
      if (allPresent && prevQueue.length >= newSongIds.length) {
        // Replace the queue with the new playlist order (keeps currentId intact if present)
        return newSongIds
      }
      // if currentId belongs to this playlist, update queue to new order so playback follows the new order
      const currentInNew = newSongIds.includes(currentId)
      if (currentInNew) {
        return newSongIds
      }
      return prevQueue
    })
  }

  // Play an entire playlist in the order it is stored (sets queue and starts first song)
  const playPlaylist = async (playlistId) => {
    const pl = playlists.find(p => p.id === playlistId)
    if (!pl || !pl.songIds || pl.songIds.length === 0) return

    // set the queue to this playlist order
    setQueue(pl.songIds)

    // set current to first song and attempt to play it
    const firstId = pl.songIds[0]
    setCurrentId(firstId)

    const audio = audioRef.current
    const firstSong = getSong(firstId)
    if (!audio || !firstSong) return

    if (audio.src !== firstSong.src) {
      audio.src = firstSong.src
      try { audio.load() } catch {}
    }
    const p = audio.play()
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(err => {
        console.warn('playPlaylist play error', err)
        setIsPlaying(false)
      })
    } else {
      setIsPlaying(true)
    }
  }

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
          playSong={playSong}
          onReorder={reorderPlaylistSongs}
          playPlaylist={playPlaylist}  
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
        />
      )
    }
    return null
  }

  return (
    <div className="app" role="application" aria-label="Byte Music">
      <audio ref={audioRef} />
      <TopNav
        onUpload={(file, imageFile) => {
          const id = 'u' + Date.now()
          const src = URL.createObjectURL(file)
          const cover = imageFile ? URL.createObjectURL(imageFile) : '/assets/cover1.jpg'
          setSongs((prev) => [
            {
              id,
              title: file.name.replace(/\.[^/.]+$/, ''),
              artist: 'Local Upload',
              src,
              cover,
              duration: 0,
            },
            ...prev,
          ])
        }}
        setTab={setTab}
        currentTab={tab}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q)
          setTab('search')
        }}
      />

      <main>{renderTab()}
       {/* Spacer so MiniPlayer doesn't overlap content */}
       <div style={{ height: 80 }} />   {/* adjust height to match MiniPlayer height */}</main>
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
