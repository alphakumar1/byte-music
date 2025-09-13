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
  type="text"
  placeholder="Search songs..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  autoFocus={autoFocus}
  style={{
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5f5f5',             // ✅ brighter text
    fontSize: 14,
    outline: 'none'
  }}
/>

    </div>
  )
}
