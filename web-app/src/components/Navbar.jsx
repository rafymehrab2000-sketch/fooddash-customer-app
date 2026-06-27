import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { cartCount } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (path) => location.pathname === path

  const t = theme

  return (
    <nav style={{
      backgroundColor: t.card,
      borderBottom: `1px solid ${t.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: `0 3px 10px ${t.accent}55`,
          }}>🍔</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: t.text }}>FoodDash</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { to: '/', label: '🏠 Home' },
            { to: '/orders', label: '📦 Orders' },
            { to: '/profile', label: '👤 Profile' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              color: isActive(to) ? t.accent : t.textSub,
              backgroundColor: isActive(to) ? t.cardAlt : 'transparent',
              border: `1px solid ${isActive(to) ? t.accent : 'transparent'}`,
              transition: 'all 0.15s',
              textDecoration: 'none',
              display: 'inline-block',
            }}>{label}</Link>
          ))}

          {/* Cart */}
          <Link to="/cart" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 700,
            color: isActive('/cart') ? t.accentText : t.accent,
            backgroundColor: isActive('/cart') ? t.accent : t.cardAlt,
            border: `1px solid ${t.accent}`,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}>
            🛒 Cart
            {cartCount > 0 && (
              <span style={{
                backgroundColor: isActive('/cart') ? t.accentText : t.accent,
                color: isActive('/cart') ? t.accent : t.accentText,
                borderRadius: '50%',
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{cartCount}</span>
            )}
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: t.cardAlt,
            border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', marginLeft: 4,
            transition: 'background 0.2s',
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
