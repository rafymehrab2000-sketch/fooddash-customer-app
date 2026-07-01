import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { NotificationsProvider, useNotifications } from './context/NotificationsContext'
import { SocketProvider, useSocket } from './context/SocketContext'
import { ToastProvider, useToast } from './components/Toast'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'

const ORDER_STATUS_MESSAGES = {
  accepted: {
    title: 'Order Accepted! ✅',
    body: (name) => `${name} has accepted your order and is preparing it.`,
    type: 'success',
  },
  preparing: {
    title: 'Order Being Prepared 👨‍🍳',
    body: (name) => `${name} is preparing your food now.`,
    type: 'info',
  },
  ready: {
    title: 'Order Ready! 📦',
    body: (name) => `Your order from ${name} is ready and waiting for pickup.`,
    type: 'info',
  },
  out_for_delivery: {
    title: 'Your Order is On Its Way! 🛵',
    body: (name) => `Your order from ${name} is out for delivery.`,
    type: 'info',
  },
  picked_up: {
    title: 'Rider Picked Up Your Order! 🛵',
    body: (name) => `Your order from ${name} has been picked up.`,
    type: 'info',
  },
  delivered: {
    title: 'Order Delivered! 🎉',
    body: (name) => `Your order from ${name} has arrived. Enjoy your meal!`,
    type: 'success',
  },
  cancelled: {
    title: 'Order Cancelled ❌',
    body: (name) => `Your order from ${name} was cancelled.`,
    type: 'error',
  },
}

function SocketListener() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { showToast } = useToast()

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleOrderStatusChanged = (data) => {
      const { orderId, status, restaurantName } = data ?? {}
      const msg = ORDER_STATUS_MESSAGES[status]
      if (!msg) return
      const name = restaurantName ?? 'your restaurant'
      const notifId = (status === 'out_for_delivery' || status === 'delivered')
        ? `order-${orderId}-${status}-${Date.now()}`
        : `order-${orderId}-${status}`
      addNotification(
        notifId,
        msg.title,
        msg.body(name),
      )
      showToast(msg.title, msg.body(name), msg.type)

      if (status === 'delivered' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Delivered! 🎉', {
          body: 'Your food has arrived!',
          icon: '/icon.svg',
        })
      }
    }

    const handlePersonalNotification = (data) => {
      const { title, body, type } = data ?? {}
      if (!title) return
      addNotification(`personal-${Date.now()}`, title, body ?? '')
      showToast(title, body ?? '', type ?? 'info')
    }

    socket.on('order_status_changed', handleOrderStatusChanged)
    if (user?.id) socket.on(`customer_${user.id}`, handlePersonalNotification)

    return () => {
      socket.off('order_status_changed', handleOrderStatusChanged)
      if (user?.id) socket.off(`customer_${user.id}`, handlePersonalNotification)
    }
  }, [socket, user?.id, addNotification, showToast])

  return null
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.bg }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { theme } = useTheme()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch(err => console.error('SW registration failed:', err))
      })
    }
  }, [])

  return (
    <>
      <SocketListener />
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.text }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/restaurant/:id" element={<ProtectedRoute><AppLayout><RestaurantPage /></AppLayout></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><AppLayout><CartPage /></AppLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AppLayout><OrdersPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <NotificationsProvider>
      <SocketProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SocketProvider>
    </NotificationsProvider>
  )
}
