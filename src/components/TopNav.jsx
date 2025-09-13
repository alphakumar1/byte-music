// src/components/TopNav.jsx
import React, { useRef, useState, useEffect } from 'react'
import { FiUpload, FiSearch, FiHome, FiHeart, FiList } from 'react-icons/fi'

export default function TopNav({ onUpload, setTab, currentTab, searchQuery, setSearchQuery }) {
  const fileRef = useRef(null)
  const imageRef = useRef(null)

  const tabs = [
    { id: 'home', label: 'Home', icon: <FiHome /> },
    { id: 'search', label: 'Search', icon: <FiSearch /> },
    { id: 'fav', label: 'Fav', icon: <FiHeart /> },
    { id: 'playlists', label: 'Playlists', icon: <FiList /> }
  ]

  // Upload logic
  const openAudioPicker = () => fileRef.current && fileRef.current.click()
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const image = imageRef.current?.files?.[0] || null
    try { onUpload(file, image) } catch (err) { console.warn('upload handler error', err) }
    e.target.value = ''
    if (imageRef.current) imageRef.current.value = ''
  }

  const activeStyle = {
    boxShadow: '0 10px 34px rgba(0,194,255,0.10)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(90deg, rgba(0,194,255,0.10), rgba(255,91,209,0.06))'
  }

  const [iconOnly, setIconOnly] = useState(false)
  useEffect(() => {
    const update = () => setIconOnly(window.innerWidth < 420)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <nav aria-label="Top navigation" style={{ width: '100%' }}>
      {/* Hidden inputs */}
      <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onFileChange} />
      <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} />

      {/* Row 1: Logo + Title + Upload */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <div style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden' }}>
            <img
              src="/assets/logo.png"
              alt="Byte Music Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          {/* Title */}
          <div style={{
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--neon-cyan)',
            textShadow: '0 0 6px var(--neon-green), 0 0 12px var(--neon-pink)'
          }}>
            BYTE MUSIC
          </div>
        </div>

        {/* Upload Button */}
        <button
          className="icon-btn"
          aria-label="Upload audio"
          title="Upload audio"
          onClick={openAudioPicker}
          style={{ display: 'inline-flex', fontSize: 18 }}
        >
          <FiUpload />
        </button>
      </div>

      {/* Row 2: Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <div className="tabs" style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 720 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className="tab"
              aria-pressed={currentTab === t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              title={t.label}
              style={currentTab === t.id ? activeStyle : { minWidth: 82, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                {!iconOnly && <span>{t.label}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
