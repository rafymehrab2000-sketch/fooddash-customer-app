import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import API from '../api'

export default function LoginPage() {
  const { theme: t } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/login', { email, password })
      login(res.data.token, res.data.user)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    }
    setLoading(false)
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
    flex: 1, padding: '14px 0', fontSize: 15,
    color: t.text, background: 'none', border: 'none', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, backgroundColor: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 40,
            boxShadow: `0 6px 20px ${t.accent}66`,
          }}>🍔</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: t.text, marginBottom: 6 }}>FoodDash</div>
          <div style={{ fontSize: 15, color: t.textMuted }}>Order food you love</div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: t.card, borderRadius: 24, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 24 }}>Sign in to your account</div>

          {error && (
            <div style={{
              backgroundColor: '#ef444420', border: '1px solid #ef4444',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              color: '#ef4444', fontSize: 14,
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={inputWrap('email')}>
              <span style={{ fontSize: 16, marginRight: 10 }}>📧</span>
              <input
                style={inputStyle}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div style={inputWrap('password')}>
              <span style={{ fontSize: 16, marginRight: 10 }}>🔒</span>
              <input
                style={inputStyle}
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ fontSize: 18, padding: 4, cursor: 'pointer', lineHeight: 1 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Remember me */}
            <div onClick={() => setRememberMe(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', userSelect: 'none' }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${rememberMe ? t.accent : t.inputBorder}`,
                backgroundColor: rememberMe ? t.accent : t.inputBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: t.accentText,
              }}>{rememberMe && '✓'}</div>
              <span style={{ fontSize: 14, color: t.textSub }}>Remember me</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', backgroundColor: t.accent, color: t.accentText,
                border: 'none', borderRadius: 14, padding: '17px',
                fontSize: 17, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.85 : 1, boxShadow: `0 4px 14px ${t.accent}66`,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: t.textMuted }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: t.accent, fontWeight: 700 }}>Register</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
