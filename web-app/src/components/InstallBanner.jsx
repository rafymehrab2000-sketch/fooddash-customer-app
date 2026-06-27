import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const DISMISSED_KEY = 'fd-install-dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function InstallBanner() {
  const { theme: t } = useTheme()
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    // Never show if already installed or previously dismissed
    if (isInStandaloneMode()) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const onIOS = isIOS()
    setIos(onIOS)

    // Chrome / Android: capture the native prompt
    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setVisible(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari has no programmatic prompt — show instructions banner instead
    if (onIOS) {
      setTimeout(() => setVisible(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    dismiss()
  }

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      padding: '0 12px 12px',
      // Safe area for iPhone home indicator
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    }}>
      <div style={{
        backgroundColor: t.card,
        borderRadius: 20,
        border: `1px solid ${t.border}`,
        boxShadow: '0 -4px 32px rgba(0,0,0,0.25)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          backgroundColor: t.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: `0 4px 12px ${t.accent}55`,
        }}>🍔</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 3 }}>
            Add FoodDash to Home Screen
          </div>
          {ios ? (
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>
              Tap <strong style={{ color: t.accent }}>Share</strong> then{' '}
              <strong style={{ color: t.accent }}>Add to Home Screen</strong> for the best experience
            </div>
          ) : (
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Install for offline access and a faster experience
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {!ios && (
            <button
              onClick={handleInstall}
              style={{
                backgroundColor: t.accent, color: t.accentText,
                border: 'none', borderRadius: 10, padding: '8px 14px',
                fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: `0 3px 10px ${t.accent}55`,
              }}
            >Install</button>
          )}
          <button
            onClick={dismiss}
            style={{
              backgroundColor: 'transparent', color: t.textMuted,
              border: `1px solid ${t.border}`, borderRadius: 10,
              padding: '7px 14px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >{ios ? 'Got it' : 'Not now'}</button>
        </div>
      </div>
    </div>
  )
}
