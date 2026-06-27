import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'

const NAV_LINKS = [
  { to: '/', label: '🏠 Home' },
  { to: '/orders', label: '📦 Orders' },
  { to: '/profile', label: '👤 Profile' },
]

export default function Navbar() {
  const { theme: t, isDark, toggleTheme } = useTheme()
  const { cartCount } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (path) => location.pathname === path

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <>
      <style>{`
        .fd-links { display: flex; }
        .fd-hamburger { display: none; }
        @media (max-width: 540px) {
          .fd-links { display: none; }
          .fd-hamburger { display: flex; }
        }
      `}</style>

      <nav style={{
        backgroundColor: t.card,
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}>
        {/* Main bar */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 16px',
          height: 60, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
              boxShadow: `0 3px 10px ${t.accent}55`,
            }}>🍔</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: t.text }}>FoodDash</span>
          </Link>

          {/* Desktop nav links */}
          <div className="fd-links" style={{ alignItems: 'center', gap: 6 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '7px 14px', borderRadius: 20,
                fontSize: 14, fontWeight: 600,
                color: isActive(to) ? t.accent : t.textSub,
                backgroundColor: isActive(to) ? t.cardAlt : 'transparent',
                border: `1px solid ${isActive(to) ? t.accent : 'transparent'}`,
                transition: 'all 0.15s', textDecoration: 'none', display: 'inline-block',
              }}>{label}</Link>
            ))}

            <Link to="/cart" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 20,
              fontSize: 14, fontWeight: 700,
              color: isActive('/cart') ? t.accentText : t.accent,
              backgroundColor: isActive('/cart') ? t.accent : t.cardAlt,
              border: `1px solid ${t.accent}`,
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              🛒 Cart
              {cartCount > 0 && (
                <span style={{
                  backgroundColor: isActive('/cart') ? t.accentText : t.accent,
                  color: isActive('/cart') ? t.accent : t.accentText,
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{cartCount}</span>
              )}
            </Link>

            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, cursor: 'pointer', marginLeft: 2, flexShrink: 0,
            }}>{isDark ? '☀️' : '🌙'}</button>
          </div>

          {/* Mobile: cart badge + theme toggle + hamburger */}
          <div className="fd-hamburger" style={{ alignItems: 'center', gap: 8 }}>
            {/* Cart icon with badge */}
            <Link to="/cart" style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: 36, height: 36, borderRadius: 10,
              backgroundColor: isActive('/cart') ? t.accent : t.cardAlt,
              border: `1px solid ${t.accent}`, textDecoration: 'none', fontSize: 18,
            }}>
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  backgroundColor: t.accent, color: t.accentText,
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, border: `2px solid ${t.card}`,
                }}>{cartCount}</span>
              )}
            </Link>

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, cursor: 'pointer',
            }}>{isDark ? '☀️' : '🌙'}</button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: menuOpen ? t.accent : t.cardAlt,
                border: `1px solid ${menuOpen ? t.accent : t.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 5, cursor: 'pointer', padding: 8,
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 18, height: 2, borderRadius: 1,
                  backgroundColor: menuOpen ? t.accentText : t.textSub,
                  transition: 'all 0.2s',
                  transform: menuOpen
                    ? i === 0 ? 'translateY(7px) rotate(45deg)'
                    : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                    : 'scaleX(0)'
                    : 'none',
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            borderTop: `1px solid ${t.border}`,
            backgroundColor: t.card,
            padding: '8px 16px 16px',
          }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '13px 16px', borderRadius: 14,
                  fontSize: 15, fontWeight: 600,
                  color: isActive(to) ? t.accent : t.text,
                  backgroundColor: isActive(to) ? t.cardAlt : 'transparent',
                  textDecoration: 'none', marginBottom: 4,
                  transition: 'background 0.15s',
                }}
              >{label}</Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
