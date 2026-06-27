import React, { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── SVG icons ─────────────────────────────────────────────────────────── */

function ShareIcon({ size = 28, color = '#F5A623' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 7 12 3 16 7" />
      <line x1="12" y1="3" x2="12" y2="16" />
      <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
    </svg>
  )
}

function PlusBoxIcon({ size = 28, color = '#F5A623' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function CheckIcon({ size = 20, color = '#1A2744' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ── Step mockups ───────────────────────────────────────────────────────── */

function Step1Mockup() {
  return (
    <div style={{ backgroundColor: '#1c1c1e', borderRadius: 16, overflow: 'hidden', border: '1px solid #3a3a3c' }}>
      <div style={{ backgroundColor: '#2c2c2e', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, backgroundColor: '#3a3a3c', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#8e8e93' }}>
          fooddash.vercel.app
        </div>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍔</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>FoodDash</div>
          <div style={{ fontSize: 10, color: '#8e8e93' }}>Order food you love</div>
        </div>
      </div>
      <div style={{ backgroundColor: '#1c1c1e', borderTop: '1px solid #3a3a3c', padding: '10px 0 6px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ padding: '4px 10px', opacity: 0.3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div style={{ padding: '4px 10px', opacity: 0.3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 10, backgroundColor: '#F5A62333', border: '1.5px solid #F5A623', position: 'relative' }}>
          <ShareIcon size={22} color="#F5A623" />
          <div style={{ position: 'absolute', inset: -4, borderRadius: 14, border: '2px solid #F5A62366', animation: 'fd-pulse 1.6s ease-out infinite' }} />
        </div>
        <div style={{ padding: '4px 10px', opacity: 0.4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20l-7-4-7 4V2z" />
          </svg>
        </div>
        <div style={{ padding: '4px 10px', opacity: 0.4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="14" rx="3" /><path d="M8 2h12a2 2 0 0 1 2 2v12" />
          </svg>
        </div>
      </div>
      <div style={{ backgroundColor: '#F5A62315', padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>↑</span>
        <span style={{ fontSize: 11, color: '#F5A623', fontWeight: 700 }}>Tap the Share button</span>
      </div>
    </div>
  )
}

function Step2Mockup() {
  return (
    <div style={{ backgroundColor: '#1c1c1e', borderRadius: 16, overflow: 'hidden', border: '1px solid #3a3a3c' }}>
      <div style={{ padding: '8px 14px', fontSize: 11, color: '#8e8e93', textAlign: 'center', borderBottom: '1px solid #3a3a3c' }}>
        Share Sheet
      </div>
      {[{ icon: '✉️', label: 'Mail' }, { icon: '💬', label: 'Messages' }].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderBottom: '1px solid #2c2c2e', opacity: 0.45 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#3a3a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
          <span style={{ fontSize: 13, color: '#fff' }}>{item.label}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', backgroundColor: '#F5A62322', border: '1.5px solid #F5A623', margin: '4px 6px', borderRadius: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusBoxIcon size={20} color="#F5A623" />
        </div>
        <span style={{ fontSize: 13, color: '#F5A623', fontWeight: 700 }}>Add to Home Screen</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#F5A623' }}>←</span>
      </div>
      <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#F5A62315' }}>
        <span style={{ fontSize: 11, color: '#F5A623', fontWeight: 700 }}>Scroll down and tap this</span>
      </div>
    </div>
  )
}

function Step3Mockup() {
  return (
    <div style={{ backgroundColor: '#1c1c1e', borderRadius: 16, overflow: 'hidden', border: '1px solid #3a3a3c' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #3a3a3c' }}>
        <span style={{ fontSize: 13, color: '#007AFF', opacity: 0.4 }}>Cancel</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Add to Home Screen</span>
        <div style={{ backgroundColor: '#F5A62333', border: '1.5px solid #F5A623', borderRadius: 8, padding: '3px 10px', position: 'relative' }}>
          <span style={{ fontSize: 13, color: '#F5A623', fontWeight: 800 }}>Add</span>
          <div style={{ position: 'absolute', inset: -4, borderRadius: 12, border: '2px solid #F5A62366', animation: 'fd-pulse 1.6s ease-out infinite' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍔</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>FoodDash</div>
          <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>fooddash.vercel.app</div>
        </div>
      </div>
      <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#F5A62315' }}>
        <span style={{ fontSize: 11, color: '#F5A623', fontWeight: 700 }}>Tap "Add" in the top right</span>
        <span style={{ fontSize: 14 }}>↗</span>
      </div>
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────────────────────── */

const STEPS = [
  { number: 1, title: 'Tap the Share button', desc: 'At the bottom of Safari, tap the Share button (box with arrow).', Mockup: Step1Mockup },
  { number: 2, title: 'Tap "Add to Home Screen"', desc: 'Scroll down in the share sheet and tap "Add to Home Screen".', Mockup: Step2Mockup },
  { number: 3, title: 'Tap "Add"', desc: 'Tap "Add" in the top right corner to install FoodDash.', Mockup: Step3Mockup },
]

export default function IOSInstallModal({ onClose }) {
  const { theme: t } = useTheme()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const bg = '#0f1a33'

  return (
    <>
      <style>{`
        @keyframes fd-pulse {
          0%   { opacity: 1; transform: scale(1); }
          70%  { opacity: 0; transform: scale(1.5); }
          100% { opacity: 0; }
        }

        /* Mobile default: bottom sheet slides up from bottom */
        @keyframes fd-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        /* Desktop: fade + scale in from center */
        @keyframes fd-dialog-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }

        /* Bottom sheet — mobile (≤540px) */
        .fd-ios-sheet {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 500;
          border-radius: 24px 24px 0 0;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: fd-sheet-up 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Centered dialog — desktop (>540px) */
        @media (min-width: 541px) {
          .fd-ios-sheet {
            top: 50%; left: 50%;
            bottom: auto; right: auto;
            transform: translate(-50%, -50%);
            width: min(92vw, 420px);
            border-radius: 24px;
            max-height: 90vh;
            animation: fd-dialog-in 0.25s ease-out both;
          }
        }

        /* Scrollable step content */
        .fd-ios-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Pinned footer — respects iPhone home indicator */
        .fd-ios-footer {
          flex-shrink: 0;
          padding: 12px 20px 16px;
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }

        /* Drag handle pill — only visible on mobile */
        .fd-drag-handle { display: flex; }
        @media (min-width: 541px) { .fd-drag-handle { display: none; } }
      `}</style>

      {/* Dimmed overlay — tap to dismiss */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 499,
          backgroundColor: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet / Dialog */}
      <div
        className="fd-ios-sheet"
        style={{
          backgroundColor: bg,
          border: `1.5px solid ${t.accent}33`,
          boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${t.accent}18`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="fd-drag-handle" style={{ justifyContent: 'center', paddingTop: 10, paddingBottom: 2, flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#3a4d7a' }} />
        </div>

        {/* Fixed header */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #1e2d50',
          backgroundColor: bg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, backgroundColor: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              boxShadow: `0 3px 10px ${t.accent}55`, flexShrink: 0,
            }}>🍔</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Add to Home Screen</div>
              <div style={{ fontSize: 11, color: '#6b7db3', marginTop: 2 }}>3 quick steps in Safari</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: '#1A2744', border: '1px solid #2d3e6e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#a0aec0', fontSize: 18, cursor: 'pointer', flexShrink: 0,
              fontWeight: 300, lineHeight: 1, padding: 0,
            }}
          >✕</button>
        </div>

        {/* Scrollable steps */}
        <div className="fd-ios-body">
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {STEPS.map(({ number, title, desc, Mockup }) => (
              <div key={number}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                    backgroundColor: t.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#1A2744',
                    boxShadow: `0 2px 8px ${t.accent}55`,
                  }}>{number}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#6b7db3', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
                <Mockup />
              </div>
            ))}
          </div>
        </div>

        {/* Pinned "Got it" button */}
        <div className="fd-ios-footer" style={{ backgroundColor: bg, borderTop: '1px solid #1e2d50' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', backgroundColor: t.accent, color: '#1A2744',
              border: 'none', borderRadius: 14, padding: '15px',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 16px ${t.accent}55`,
            }}
          >
            <CheckIcon size={18} color="#1A2744" />
            Got it!
          </button>
        </div>
      </div>
    </>
  )
}
