import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useNotifications } from '../context/NotificationsContext'
import IOSInstallModal from './IOSInstallModal'

const NAV_LINKS = [
  { to: '/', label: '🏠 Home' },
  { to: '/orders', label: '📦 Orders' },
  { to: '/profile', label: '👤 Profile' },
]

function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 16l-6-6h3.5V4h5v6H18l-6 6z"/>
      <rect x="4" y="19" width="16" height="2" rx="1"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  )
}

function NotifDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, t, dropdownRef, posStyle }) {
  const hasUnread = notifications.some(n => !n.read)
  return (
    <div ref={dropdownRef} style={{
      position: 'fixed',
      width: 320, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
      backgroundColor: t.card, borderRadius: 16,
      border: `1px solid ${t.border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      zIndex: 9999,
      ...posStyle,
    }}>
      <div style={{
        padding: '14px 16px 12px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, backgroundColor: t.card, zIndex: 1,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Notifications</span>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            style={{
              fontSize: 12, color: t.accent, cursor: 'pointer',
              background: 'none', border: 'none', fontWeight: 600, padding: '2px 6px',
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
          <div style={{ fontSize: 13, color: t.textMuted }}>No notifications yet</div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>
            Order updates will appear here
          </div>
        </div>
      ) : (
        notifications.slice(0, 20).map((n, idx) => (
          <div
            key={n.id}
            onClick={() => onMarkAsRead(n.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 16px',
              borderBottom: idx < Math.min(notifications.length, 20) - 1
                ? `1px solid ${t.borderDark}` : 'none',
              backgroundColor: n.read ? 'transparent' : `${t.accent}18`,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 5,
              backgroundColor: n.read ? 'transparent' : t.accent,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: t.text,
                marginBottom: 2, lineHeight: 1.3,
              }}>
                {n.title}
              </div>
              <div style={{
                fontSize: 12, color: t.textMuted,
                lineHeight: 1.4, marginBottom: 4,
              }}>
                {n.body}
              </div>
              <div style={{ fontSize: 10, color: t.textDim }}>
                {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {new Date(n.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function Navbar() {
  const { theme: t, isDark, toggleTheme } = useTheme()
  const { cartCount } = useCart()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const desktopNotifRef = useRef(null)
  const mobileNotifRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 68, right: 12 })

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    setMenuOpen(false)
    setShowIOSModal(false)
    setShowNotifDropdown(false)
  }, [location.pathname])

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifDropdown) return
    const handler = (e) => {
      const inDesktop = desktopNotifRef.current?.contains(e.target)
      const inMobile = mobileNotifRef.current?.contains(e.target)
      const inDropdown = dropdownRef.current?.contains(e.target)
      if (!inDesktop && !inMobile && !inDropdown) setShowNotifDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifDropdown])

  // PWA install detection
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)
    if (ios) setShowInstallBtn(true)

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstallBtn(false)
        setDeferredPrompt(null)
      }
    }
  }

  const toggleNotif = (refEl) => {
    if (!showNotifDropdown && refEl) {
      const rect = refEl.getBoundingClientRect()
      setDropdownPos({
        top: Math.round(rect.bottom + 8),
        right: Math.round(window.innerWidth - rect.right),
      })
    }
    setMenuOpen(false)
    setShowNotifDropdown(o => !o)
  }

  const bellButtonStyle = (active) => ({
    width: 36, height: 36, borderRadius: '50%',
    backgroundColor: active ? t.accent : t.cardAlt,
    border: `1px solid ${active ? t.accent : t.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative', flexShrink: 0,
    color: active ? t.accentText : t.textSub,
  })

  const installBtnStyle = {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: t.accent,
    border: `1px solid ${t.accent}`,
    color: t.accentText,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    boxShadow: `0 2px 8px ${t.accent}55`,
    position: 'relative',
  }

  const badgeStyle = {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', color: '#fff',
    borderRadius: '50%', width: 18, height: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 800, border: `2px solid ${t.card}`,
    lineHeight: 1, pointerEvents: 'none',
  }

  return (
    <>
      <style>{`
        .fd-links { display: flex; }
        .fd-hamburger { display: none; }
        @media (max-width: 540px) {
          .fd-links { display: none; }
          .fd-hamburger { display: flex; }
        }
        @media (display-mode: standalone) {
          .fd-nav {
            padding-top: env(safe-area-inset-top);
          }
        }
      `}</style>

      <nav className="fd-nav" style={{
        backgroundColor: t.card,
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}>
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

          {/* Desktop nav */}
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

            {/* Desktop notification bell */}
            <div ref={desktopNotifRef} style={{ position: 'relative' }}>
              <button onClick={() => toggleNotif(desktopNotifRef.current)} style={bellButtonStyle(showNotifDropdown)}>
                <BellIcon />
                {unreadCount > 0 && (
                  <span style={badgeStyle}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
            </div>
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, cursor: 'pointer', marginLeft: 2, flexShrink: 0,
            }}>{isDark ? '☀️' : '🌙'}</button>
          </div>

          {/* Mobile row */}
          <div className="fd-hamburger" style={{ alignItems: 'center', gap: 8 }}>
            {/* Cart icon */}
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

            {/* Mobile notification bell */}
            <div ref={mobileNotifRef} style={{ position: 'relative' }}>
              <button onClick={() => toggleNotif(mobileNotifRef.current)} style={bellButtonStyle(showNotifDropdown)}>
                <BellIcon />
                {unreadCount > 0 && (
                  <span style={badgeStyle}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
            </div>

            {/* Install button — only when installable */}
            {showInstallBtn && (
              <button onClick={handleInstall} style={installBtnStyle} title="Add to Home Screen">
                <DownloadIcon />
              </button>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, cursor: 'pointer',
            }}>{isDark ? '☀️' : '🌙'}</button>

            {/* Hamburger */}
            <button
              onClick={() => { setShowNotifDropdown(false); setMenuOpen(o => !o) }}
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

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            borderTop: `1px solid ${t.border}`,
            backgroundColor: t.card,
            padding: '8px 16px 16px',
          }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center',
                padding: '13px 16px', borderRadius: 14,
                fontSize: 15, fontWeight: 600,
                color: isActive(to) ? t.accent : t.text,
                backgroundColor: isActive(to) ? t.cardAlt : 'transparent',
                textDecoration: 'none', marginBottom: 4,
                transition: 'background 0.15s',
              }}>{label}</Link>
            ))}
          </div>
        )}
      </nav>
      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      {showNotifDropdown && (
        <NotifDropdown
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          t={t}
          dropdownRef={dropdownRef}
          posStyle={dropdownPos}
        />
      )}
    </>
  )
}
