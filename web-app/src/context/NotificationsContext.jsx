import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'fd-web-notifications-v2'
const NotificationsContext = createContext(null)

function playNotificationSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1318.5, ctx.currentTime)
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.45)
    osc.onended = () => { try { ctx.close() } catch {} }
  } catch {}
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const persist = useCallback((list) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
  }, [])

  const addNotification = useCallback((id, title, body) => {
    setNotifications(prev => {
      if (prev.some(n => n.id === id)) return prev
      const item = {
        id,
        title: title ?? 'Notification',
        body: body ?? '',
        time: new Date().toISOString(),
        read: false,
      }
      const next = [item, ...prev].slice(0, 50)
      persist(next)
      playNotificationSound()
      return next
    })
  }, [persist])

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      persist(next)
      return next
    })
  }, [persist])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      persist(next)
      return next
    })
  }, [persist])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const value = useMemo(() => ({
    notifications, addNotification, markAsRead, markAllAsRead, unreadCount,
  }), [notifications, addNotification, markAsRead, markAllAsRead, unreadCount])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationsContext)
