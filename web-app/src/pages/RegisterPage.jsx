import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const PW_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One number', test: v => /[0-9]/.test(v) },
]

function PasswordStrength({ password, t }) {
  if (!password) return null
  const passed = PW_RULES.filter(r => r.test(password)).length
  const colors = ['#ef4444', '#ff9800', '#F5A623', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  return (
    <div style={{ marginBottom: 10, marginTop: -4 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i < passed ? colors[passed - 1] : t.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: colors[passed - 1] || t.textMuted, textAlign: 'right' }}>
        {passed > 0 ? labels[passed - 1] : 'Too weak'}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { theme: t } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', { name, email, password, phone, role: 'customer' })
      const res = await API.post('/auth/login', { email, password })
      login(res.data.token, res.data.user)
      navigate('/')
    } catch {
      setError('Registration failed. Email may already exist.')
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
          <div style={{ fontSize: 15, color: t.textMuted }}>Delicious food, delivered fast</div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: t.card, borderRadius: 24, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>Create account</div>
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 24 }}>Join thousands of food lovers</div>

          {error && (
            <div style={{
              backgroundColor: '#ef444420', border: '1px solid #ef4444',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              color: '#ef4444', fontSize: 14,
            }}>{error}</div>
          )}

          <form onSubmit={handleRegister}>
            {[
              { field: 'name', icon: '👤', placeholder: 'Full name', value: name, onChange: setName, type: 'text' },
              { field: 'email', icon: '📧', placeholder: 'Email address', value: email, onChange: setEmail, type: 'email' },
              { field: 'phone', icon: '📞', placeholder: 'Phone number (optional)', value: phone, onChange: setPhone, type: 'tel' },
            ].map(({ field, icon, placeholder, value, onChange, type }) => (
              <div key={field} style={inputWrap(field)}>
                <span style={{ fontSize: 16, marginRight: 10 }}>{icon}</span>
                <input
                  style={inputStyle}
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  onFocus={() => setFocused(field)}
                  onBlur={() => setFocused(null)}
                />
              </div>
            ))}

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

            <PasswordStrength password={password} t={t} />

            {password.length > 0 && (
              <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PW_RULES.map(rule => {
                  const ok = rule.test(password)
                  return (
                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: ok ? t.good : t.textDim, width: 16, textAlign: 'center' }}>{ok ? '✓' : '○'}</span>
                      <span style={{ fontSize: 13, color: ok ? t.textSub : t.textDim }}>{rule.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', backgroundColor: t.accent, color: t.accentText,
                border: 'none', borderRadius: 14, padding: '17px',
                fontSize: 17, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.85 : 1, boxShadow: `0 4px 14px ${t.accent}66`,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: t.textMuted }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: t.accent, fontWeight: 700 }}>Sign In</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
