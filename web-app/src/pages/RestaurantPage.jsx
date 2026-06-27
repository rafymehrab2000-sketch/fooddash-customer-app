import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import API from '../api'

const MENU_CATEGORIES = ['All', 'Starters', 'Mains', 'Sides', 'Drinks', 'Desserts']

function MenuItemCard({ item, qty, onAdd, onRemove, t }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', backgroundColor: t.card, borderRadius: 16, overflow: 'hidden',
        boxShadow: hovered ? '0 6px 18px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${t.border}`, transition: 'all 0.2s',
        opacity: item.available ? 1 : 0.5,
      }}
    >
      {/* Image */}
      <div style={{ width: 90, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 36 }}>🍽️</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
          {!item.available && (
            <span style={{ fontSize: 10, color: t.textMuted, backgroundColor: t.cardAlt, padding: '2px 7px', borderRadius: 8, fontWeight: 600 }}>Unavailable</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description || 'No description available'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: t.accent }}>€{item.price?.toFixed(2)}</span>
          {item.available ? (
            qty > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: t.cardAlt, borderRadius: 22, border: `1px solid ${t.accent}` }}>
                <button onClick={() => onRemove(item)} style={{ padding: '6px 12px', fontSize: 18, fontWeight: 800, color: t.accent, cursor: 'pointer', lineHeight: 1 }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: t.text, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => onAdd(item)} style={{ padding: '6px 12px', fontSize: 18, fontWeight: 800, color: t.accent, cursor: 'pointer', lineHeight: 1 }}>+</button>
              </div>
            ) : (
              <button onClick={() => onAdd(item)} style={{
                backgroundColor: t.accent, color: t.accentText, border: 'none',
                borderRadius: 22, padding: '8px 16px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                boxShadow: `0 2px 8px ${t.accent}44`,
              }}>Add +</button>
            )
          ) : (
            <div style={{ backgroundColor: t.cardAlt, borderRadius: 22, padding: '8px 12px', fontSize: 11, color: t.textMuted, fontWeight: 600 }}>Unavailable</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RestaurantPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme: t } = useTheme()
  const { addToCart, removeFromCart, getQty, cartCount, cartTotal, items: cartItems } = useCart()

  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null)
  const [loading, setLoading] = useState(!restaurant)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    if (!restaurant) {
      API.get('/restaurants').then(res => {
        const found = res.data.find(r => r.id.toString() === id)
        if (found) setRestaurant(found)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [id, restaurant])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: t.accent, fontSize: 32 }}>⏳</div>
  )
  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: 60, color: t.textMuted }}>Restaurant not found.</div>
  )

  const cartFromThis = cartItems.filter(i => (restaurant.menuItems || []).some(m => m.id === i.id))
  const localCount = cartFromThis.reduce((s, i) => s + i.quantity, 0)
  const localTotal = cartFromThis.reduce((s, i) => s + i.price * i.quantity, 0)

  const filtered = (restaurant.menuItems || []).filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase()
    return matchSearch && matchCat
  })

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: t.card, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
          <button onClick={() => navigate(-1)} style={{ color: t.textMuted, fontSize: 15, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back
          </button>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Hero image */}
            <div style={{ width: 160, height: 140, backgroundColor: t.cardAlt, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 56 }}>🍽️</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>{restaurant.name}</div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 8, alignItems: 'center' }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: t.accent, fontSize: 14 }}>{i <= 4 ? '★' : '½'}</span>
                ))}
                <span style={{ fontSize: 13, color: t.textSub, marginLeft: 6, fontWeight: 600 }}>4.5</span>
              </div>
              <div style={{ fontSize: 14, color: t.textSub, marginBottom: 12 }}>📍 {restaurant.address}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: restaurant.isOpen ? '#22c55e' : '#ef4444',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 20,
                }}>{restaurant.isOpen ? '● Open' : '● Closed'}</span>
                <span style={{ color: t.border }}>·</span>
                <span style={{ fontSize: 13, color: t.textSub }}>🕐 25–35 min</span>
                <span style={{ color: t.border }}>·</span>
                <span style={{ fontSize: 13, color: t.textSub }}>🍴 {restaurant.menuItems?.length || 0} items</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: t.inputBg, borderRadius: 14,
            border: `1px solid ${searchFocused ? t.accent : t.inputBorder}`,
            paddingLeft: 14, paddingRight: 14, marginTop: 16,
            boxShadow: searchFocused ? `0 0 0 3px ${t.accent}33` : 'none',
            transition: 'all 0.2s', maxWidth: 500,
          }}>
            <span style={{ fontSize: 15, marginRight: 8 }}>🔍</span>
            <input
              style={{ flex: 1, padding: '12px 0', fontSize: 14, color: t.text, background: 'none', border: 'none', outline: 'none' }}
              placeholder="Search menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ fontSize: 13, color: t.textMuted, cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? t.accent : t.cardAlt,
                  border: `1px solid ${activeCategory === cat ? t.accent : t.border}`,
                  color: activeCategory === cat ? t.accentText : t.textSub,
                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                }}
              >{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Menu</div>
          <div style={{ fontSize: 13, color: t.textMuted }}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 8 }}>No items found</div>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 20 }}>Try a different search or category</div>
            {(search || activeCategory !== 'All') && (
              <button onClick={() => { setSearch(''); setActiveCategory('All') }} style={{
                backgroundColor: t.accent, color: t.accentText, border: 'none',
                padding: '12px 24px', borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                onAdd={(item) => addToCart(item, restaurant)}
                onRemove={(item) => removeFromCart(item)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {localCount > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: '90%', maxWidth: 480 }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              width: '100%', backgroundColor: t.accent, color: t.accentText,
              border: 'none', borderRadius: 18, padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 6px 20px ${t.accent}66`,
            }}
          >
            <span style={{
              backgroundColor: t.accentText, color: t.accent,
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800,
            }}>{localCount}</span>
            <span>View Cart</span>
            <span>€{localTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
