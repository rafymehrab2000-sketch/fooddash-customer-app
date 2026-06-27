import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const MENU_ITEMS = [
  { key: 'orders', icon: '📦', label: 'My Orders' },
  { key: 'addresses', icon: '📍', label: 'Saved Addresses' },
  { key: 'payment', icon: '💳', label: 'Payment Methods' },
  { key: 'help', icon: '🛟', label: 'Help & Support' },
]

export default function ProfilePage() {
  const { theme: t, isDark, toggleTheme } = useTheme()
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [focused, setFocused] = useState(null)

  const handleSave = () => {
    if (!editName.trim()) { alert('Name cannot be empty'); return }
    updateUser({ ...user, name: editName.trim(), phone: editPhone.trim() })
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(user?.name || '')
    setEditPhone(user?.phone || '')
    setEditing(false)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const inputWrap = (field) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: t.inputBg, borderRadius: 14,
    border: `1px solid ${focused === field ? t.accent : t.inputBorder}`,
    paddingLeft: 14, paddingRight: 14, marginBottom: 14,
    boxShadow: focused === field ? `0 0 0 3px ${t.accent}33` : 'none',
    transition: 'all 0.2s',
  })

  const inputStyle = {
    flex: 1, padding: '13px 0', fontSize: 15,
    color: t.text, background: 'none', border: 'none', outline: 'none',
  }

  const initial = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Header */}
        <div style={{ backgroundColor: t.card, borderRadius: '0 0 24px 24px', padding: '32px 24px', marginBottom: 24, textAlign: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            position: 'absolute', top: 20, right: 20,
            width: 42, height: 42, borderRadius: '50%',
            backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, cursor: 'pointer',
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{ width: 96, height: 96, borderRadius: 48, border: `3px solid ${t.accent}`, padding: 3, display: 'inline-flex' }}>
              <div style={{ flex: 1, borderRadius: '50%', backgroundColor: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: t.accentText }}>{initial}</span>
              </div>
            </div>
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                position: 'absolute', bottom: 0, right: -4,
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: t.card, border: `2px solid ${t.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, cursor: 'pointer',
              }}
            >{editing ? '✕' : '✏️'}</button>
          </div>

          <div style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 4 }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: 14, color: t.textSub, marginBottom: 12 }}>{user?.email || ''}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: t.cardAlt, border: `1px solid ${t.border}`, padding: '6px 14px', borderRadius: 20 }}>
            <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>🎭 {user?.role || 'customer'}</span>
          </div>
        </div>

        {/* Edit Panel */}
        {editing && (
          <div style={{ backgroundColor: t.card, borderRadius: 20, padding: 20, marginBottom: 16, border: `1px solid ${t.accent}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 16 }}>Edit Profile</div>

            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Name</div>
            <div style={inputWrap('editName')}>
              <span style={{ fontSize: 16, marginRight: 10 }}>👤</span>
              <input
                style={inputStyle}
                placeholder="Full name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onFocus={() => setFocused('editName')}
                onBlur={() => setFocused(null)}
                autoFocus
              />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Phone</div>
            <div style={inputWrap('editPhone')}>
              <span style={{ fontSize: 16, marginRight: 10 }}>📞</span>
              <input
                style={inputStyle}
                placeholder="Phone number"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                onFocus={() => setFocused('editPhone')}
                onBlur={() => setFocused(null)}
                type="tel"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={handleCancelEdit} style={{
                flex: 1, borderRadius: 12, padding: 14, border: `1px solid ${t.border}`,
                backgroundColor: t.cardAlt, color: t.textSub, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                flex: 2, borderRadius: 12, padding: 14, border: 'none',
                backgroundColor: t.accent, color: t.accentText, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                boxShadow: `0 3px 10px ${t.accent}55`,
              }}>Save Changes</button>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Account Info</div>
        <div style={{ backgroundColor: t.card, borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[
            { icon: '👤', label: 'Name', value: user?.name },
            { icon: '📧', label: 'Email', value: user?.email },
            ...(user?.phone ? [{ icon: '📞', label: 'Phone', value: user.phone }] : []),
          ].map(({ icon, label, value }, idx, arr) => (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', alignItems: 'center', padding: 16, gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>{value || '—'}</div>
                </div>
              </div>
              {idx < arr.length - 1 && <div style={{ height: 1, backgroundColor: t.border, marginLeft: 68 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Quick Actions</div>
        <div style={{ backgroundColor: t.card, borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {MENU_ITEMS.map(({ key, icon, label }, idx) => (
            <React.Fragment key={key}>
              <button
                onClick={() => alert('Coming Soon! This feature is not yet available.')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = t.cardAlt}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>{label}</span>
                </div>
                <span style={{ fontSize: 22, color: t.accent, fontWeight: 300 }}>›</span>
              </button>
              {idx < MENU_ITEMS.length - 1 && <div style={{ height: 1, backgroundColor: t.border, marginLeft: 68 }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: t.textDim, marginBottom: 16 }}>FoodDash v1.0.0 · Web Edition</div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            backgroundColor: t.card, border: `1px solid ${t.logoutBorder}`,
            borderRadius: 20, padding: 18, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = t.cardAlt}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = t.card}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ color: '#f87171', fontSize: 16, fontWeight: 700 }}>Logout</span>
        </button>
      </div>
    </div>
  )
}
