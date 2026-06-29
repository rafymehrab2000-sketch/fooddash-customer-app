import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useSocket } from '../context/SocketContext'
import API from '../api'

const STATUS_COLOR = {
  pending: '#ff9800',
  accepted: '#2196F3',
  preparing: '#9C27B0',
  ready: '#00BCD4',
  out_for_delivery: '#00BCD4',
  delivered: '#4CAF50',
  cancelled: '#f44336',
}

const STATUS_EMOJI = {
  pending: '⏳',
  accepted: '✅',
  preparing: '👨‍🍳',
  ready: '📦',
  out_for_delivery: '🛵',
  delivered: '🎉',
  cancelled: '❌',
}

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered']
const ACTIVE_STATUSES = ['accepted', 'preparing', 'ready', 'out_for_delivery']

function ETATimer({ startMinutes = 30, t }) {
  const [minutes, setMinutes] = useState(startMinutes)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => setMinutes(p => (p <= 1 ? 0 : p - 1)), 60000)
    return () => clearInterval(ref.current)
  }, [])

  useEffect(() => { if (minutes === 0) clearInterval(ref.current) }, [minutes])

  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>ETA</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: t.accent, fontVariantNumeric: 'tabular-nums' }}>{minutes}</div>
      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{minutes === 0 ? 'Arriving!' : 'min left'}</div>
    </div>
  )
}

function ProgressBar({ status, t }) {
  if (status === 'cancelled') return null
  const currentStep = STATUS_STEPS.indexOf(status)

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      {STATUS_STEPS.map((step, idx) => (
        <React.Fragment key={step}>
          <div style={{
            width: idx === currentStep ? 14 : 10,
            height: idx === currentStep ? 14 : 10,
            borderRadius: '50%',
            backgroundColor: idx <= currentStep ? t.accent : t.border,
            boxShadow: idx === currentStep ? `0 0 0 4px ${t.accent}44` : 'none',
            flexShrink: 0, transition: 'all 0.3s',
          }} />
          {idx < STATUS_STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2,
              backgroundColor: idx < currentStep ? t.accent : t.border,
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function RiderCard({ rider, t }) {
  const name = rider?.name || 'Your Rider'
  const initial = name.charAt(0).toUpperCase()
  const full = Math.floor(rider?.rating || 4.8)

  return (
    <div style={{ backgroundColor: t.bg, borderRadius: 16, marginBottom: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 14, gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: t.accentText }}>{initial}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: t.good, border: `2px solid ${t.bg}` }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Your rider</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 4 }}>{name}</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 13, color: t.accent }}>{i <= full ? '★' : '☆'}</span>
            ))}
            <span style={{ fontSize: 12, color: t.textSub, marginLeft: 4 }}>{(rider?.rating || 4.8).toFixed(1)}</span>
          </div>
        </div>
        <ETATimer t={t} />
      </div>
      <div style={{ height: 1, backgroundColor: t.border, margin: '0 14px' }} />
      <div style={{ display: 'flex' }}>
        {[
          { icon: '📞', label: 'Call', action: () => alert(`Calling ${name}...`) },
          { icon: '💬', label: 'Message', action: () => alert(`Opening chat with ${name}...`) },
        ].map((btn, idx) => (
          <React.Fragment key={btn.label}>
            {idx > 0 && <div style={{ width: 1, backgroundColor: t.border, margin: '8px 0' }} />}
            <button onClick={btn.action} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 18 }}>{btn.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{btn.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { theme: t } = useTheme()
  const { socket } = useSocket()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get('/orders')
      setOrders([...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch { console.error('Failed to fetch orders') }
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (!socket) return

    const handleNewOrder = () => fetchOrders()

    const handleStatusChanged = (data) => {
      const { orderId, status } = data ?? {}
      if (!orderId || !status) return
      const id = Number(orderId)
      setOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status } : o)
      )
    }

    socket.on('new_order', handleNewOrder)
    socket.on('order_status_changed', handleStatusChanged)

    return () => {
      socket.off('new_order', handleNewOrder)
      socket.off('order_status_changed', handleStatusChanged)
    }
  }, [socket, fetchOrders])

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: t.card, borderBottom: `1px solid ${t.border}`, padding: '24px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.accent, marginBottom: 4 }}>My Orders</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 15, color: t.textMuted }}>Track your deliveries</div>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: socket?.connected ? '#4CAF50' : '#f44336',
              flexShrink: 0,
            }} title={socket?.connected ? 'Live updates active' : 'Connecting...'} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        {!loading && (
          <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: t.accent, fontSize: 32 }}>⏳</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🧾</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>No orders yet</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>Your orders will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order.id} style={{ backgroundColor: t.card, borderRadius: 20, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: `1px solid ${t.border}` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 3 }}>Order #{order.id}</div>
                    <div style={{ fontSize: 13, color: t.textSub }}>{order.restaurant?.name}</div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    backgroundColor: STATUS_COLOR[order.status] || '#888',
                    color: '#fff', padding: '6px 12px', borderRadius: 20,
                    transition: 'background-color 0.4s ease',
                  }}>
                    <span style={{ fontSize: 13 }}>{STATUS_EMOJI[order.status] || '📋'}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                      {order.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <ProgressBar status={order.status} t={t} />

                {ACTIVE_STATUSES.includes(order.status) && (
                  <RiderCard rider={order.assignedRider} t={t} />
                )}

                {/* Items */}
                <div style={{ backgroundColor: t.bg, borderRadius: 12, padding: '0 14px', marginBottom: 16, border: `1px solid ${t.borderDark}` }}>
                  {order.orderItems?.map((oi, idx) => (
                    <div key={oi.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0',
                      borderBottom: idx < order.orderItems.length - 1 ? `1px solid ${t.borderDark}` : 'none',
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.accent }}>{oi.quantity}</span>
                      </div>
                      <span style={{ flex: 1, fontSize: 13, color: t.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {oi.menuItem?.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
                  <span style={{ fontSize: 13, color: t.textMuted }}>
                    🗓 {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: t.accent }}>€{order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
