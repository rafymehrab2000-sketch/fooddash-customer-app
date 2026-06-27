import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Sushi', 'Asian']
const CATEGORY_EMOJIS = { All: '🍽️', Burgers: '🍔', Pizza: '🍕', Sushi: '🍣', Asian: '🥢' }
const SORT_OPTIONS = ['Default', 'Open first', 'Most items']

function RestaurantCard({ item, onClick, t }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: t.card, borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.18)' : '0 4px 12px rgba(0,0,0,0.08)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s',
        border: `1px solid ${t.border}`,
      }}
    >
      {/* Image placeholder */}
      <div style={{ height: 130, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 52 }}>🍽️</span>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          backgroundColor: item.isOpen ? '#22c55e' : '#ef4444',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
        }}>{item.isOpen ? 'Open' : 'Closed'}</div>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: t.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
          <span style={{ fontSize: 20, color: t.accent, fontWeight: 300, marginLeft: 8 }}>›</span>
        </div>
        <div style={{ fontSize: 13, color: t.textSub, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📍 {item.address}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>🍴 {item.menuItems?.length || 0} items</span>
          <div style={{ width: 1, height: 12, backgroundColor: t.border, margin: '0 10px' }} />
          <span style={{ fontSize: 12, color: t.textMuted }}>🕐 25–35 min</span>
          <div style={{ width: 1, height: 12, backgroundColor: t.border, margin: '0 10px' }} />
          <span style={{ fontSize: 12, color: t.accent }}>€3.50 delivery</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { theme: t } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('Default')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  useEffect(() => { fetchRestaurants() }, [])

  const fetchRestaurants = async () => {
    try {
      const res = await API.get('/restaurants')
      setRestaurants(res.data)
    } catch { console.error('Failed to fetch restaurants') }
    setLoading(false)
  }

  const filtered = restaurants
    .filter(r => {
      const matchCat = activeCategory === 'All' ||
        r.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(activeCategory.toLowerCase())
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.address?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (activeSort === 'Open first') return (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0)
      if (activeSort === 'Most items') return (b.menuItems?.length || 0) - (a.menuItems?.length || 0)
      return 0
    })

  const featured = restaurants[0]

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: t.card, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 20px' }}>
          <div style={{ fontSize: 13, color: t.textDim, marginBottom: 4 }}>📍 Jyväskylä, Finland</div>
          <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 6 }}>
            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 16 }}>What are you craving?</div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: t.inputBg, borderRadius: 14,
            border: `1px solid ${searchFocused ? t.accent : t.inputBorder}`,
            paddingLeft: 14, paddingRight: 14,
            boxShadow: searchFocused ? `0 0 0 3px ${t.accent}33` : 'none',
            transition: 'all 0.2s', maxWidth: 600,
          }}>
            <span style={{ fontSize: 16, marginRight: 8 }}>🔍</span>
            <input
              style={{ flex: 1, padding: '13px 0', fontSize: 15, color: t.text, background: 'none', border: 'none', outline: 'none' }}
              placeholder="Search restaurants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ fontSize: 13, color: t.textMuted, cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Featured */}
        {!loading && featured && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Featured</div>
            <div
              onClick={() => navigate(`/restaurant/${featured.id}`, { state: { restaurant: featured } })}
              style={{
                backgroundColor: t.card, borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                boxShadow: `0 4px 16px ${t.accent}22`, border: `1px solid ${t.border}`,
                display: 'flex', gap: 0,
              }}
            >
              <div style={{ minHeight: 130, width: 160, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                <span style={{ fontSize: 52 }}>🌟</span>
                <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: t.accent, color: t.accentText, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>⭐ Featured</div>
                <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: featured.isOpen ? '#22c55e' : '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {featured.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
              <div style={{ padding: 20, flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 6 }}>{featured.name}</div>
                <div style={{ fontSize: 13, color: t.textSub, marginBottom: 12 }}>📍 {featured.address}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: t.textMuted }}>🍴 {featured.menuItems?.length || 0} items</span>
                  <span style={{ color: t.border }}>·</span>
                  <span style={{ fontSize: 13, color: t.textMuted }}>🕐 25–35 min</span>
                  <span style={{ color: t.border }}>·</span>
                  <span style={{ fontSize: 13, color: t.accent }}>€3.50 delivery</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                backgroundColor: activeCategory === cat ? t.accent : t.card,
                border: `1px solid ${activeCategory === cat ? t.accent : t.border}`,
                color: activeCategory === cat ? t.accentText : t.textSub,
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              }}
            >
              <span>{CATEGORY_EMOJIS[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* List header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, color: t.textMuted }}>
            {loading ? 'Loading...' : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} near you`}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setActiveSort(opt)}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  backgroundColor: activeSort === opt ? t.cardAlt : 'transparent',
                  border: `1px solid ${activeSort === opt ? t.accent : t.border}`,
                  color: activeSort === opt ? t.accent : t.textMuted,
                  transition: 'all 0.15s',
                }}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* Restaurant grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: t.accent, fontSize: 32 }}>⏳</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 8 }}>No restaurants found</div>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 20 }}>Try a different category or search</div>
            {(activeCategory !== 'All' || search) && (
              <button onClick={() => { setActiveCategory('All'); setSearch('') }} style={{
                backgroundColor: t.accent, color: t.accentText, border: 'none',
                padding: '12px 24px', borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(item => (
              <RestaurantCard
                key={item.id}
                item={item}
                t={t}
                onClick={() => navigate(`/restaurant/${item.id}`, { state: { restaurant: item } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
