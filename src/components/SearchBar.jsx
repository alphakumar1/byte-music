import React, { useEffect, useRef } from 'react'

export default function SearchBar({ query, setQuery, autoFocus = false }) {
  const ref = useRef(null)
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [autoFocus])
  return (
    <div style={{margin: '12px 0'}}>
      <input
        ref={ref}
        className="search-input"
        aria-label="Search"
        placeholder="Search songs, artists, playlists..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{width:'100%', padding:'10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.03)', background:'rgba(255,255,255,0.02)'}}
      />
    </div>
  )
}
