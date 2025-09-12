import React, { useRef, useState, useEffect } from 'react'
import { FiUpload, FiSearch, FiHome, FiHeart, FiList } from 'react-icons/fi'

/**
 * TopNav (updated)
 * - Layout: two stacked rows
 *   Row 1 (top): logo (left)  --- upload button (right)
 *   Row 2 (under): tabs in a single horizontal line centered (Home / Search / Fav / Playlists)
 * - Removed text "Byte Music" (logo-only on the left)
 * - Tabs are accessible buttons, show icon + label, and get a stronger visual accent when active
 *
 * Props:
 *  - onUpload(file, imageFile)
 *  - setTab(tabName)
 *  - currentTab (string)
 *  - searchQuery, setSearchQuery
 *
 * Logo path: /assets/logo.png (fallback: an empty space if missing)
 */

export default function TopNav({ onUpload, setTab, currentTab, searchQuery, setSearchQuery }) {
  const fileRef = useRef(null)
  const imageRef = useRef(null)

  const tabs = [
    { id: 'home', label: 'Home', icon: <FiHome /> },
    { id: 'search', label: 'Search', icon: <FiSearch /> },
    { id: 'fav', label: 'Fav', icon: <FiHeart /> },
    { id: 'playlists', label: 'Playlists', icon: <FiList /> }
  ]

  // upload actions
  const openAudioPicker = () => fileRef.current && fileRef.current.click()
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const image = imageRef.current?.files?.[0] || null
    try { onUpload(file, image) } catch (err) { console.warn('upload handler error', err) }
    e.target.value = ''
    if (imageRef.current) imageRef.current.value = ''
  }

  // small helper for active style (keeps styling logic here, so we don't modify global CSS)
  const activeStyle = {
    boxShadow: '0 10px 34px rgba(0,194,255,0.10)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(90deg, rgba(0,194,255,0.10), rgba(255,91,209,0.06))'
  }

  // responsive: collapse labels on very small screens (icon-only)
  const [iconOnly, setIconOnly] = useState(false)
  useEffect(() => {
    const update = () => setIconOnly(window.innerWidth < 420)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <nav aria-label="Top navigation" style={{width:'100%'}}>
      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept="audio/*" style={{display:'none'}} onChange={onFileChange} />
      <input ref={imageRef} type="file" accept="image/*" style={{display:'none'}} />

      {/* Row 1: Logo (left) and Upload (right) */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:8}}>
        {/* Logo only (image). If logo.png missing, the img will hide itself gracefully */}
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:48, height:48, borderRadius:12, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <img
              src="/assets/logo.png"
              alt="Byte Music"
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <button
            className="icon-btn"
            aria-label="Upload audio"
            title="Upload audio"
            onClick={openAudioPicker}
            style={{display:'inline-flex'}}
          >
            <FiUpload />
          </button>
        </div>
      </div>

      {/* Row 2: Tabs centered in one horizontal line */}
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', paddingTop:4}}>
        <div className="tabs" style={{display:'flex', gap:10, alignItems:'center', justifyContent:'center', width:'100%', maxWidth:720}}>
          {tabs.map(t => (
            <button
              key={t.id}
              className="tab"
              aria-pressed={currentTab === t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              title={t.label}
              style={currentTab === t.id ? activeStyle : {minWidth:82, display:'inline-flex', alignItems:'center', justifyContent:'center'}}
            >
              <span style={{display:'inline-flex', gap:8, alignItems:'center'}}>
                <span style={{display:'inline-flex', fontSize:16}} aria-hidden>{t.icon}</span>
                {!iconOnly && <span style={{display:'inline-block'}}>{t.label}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
