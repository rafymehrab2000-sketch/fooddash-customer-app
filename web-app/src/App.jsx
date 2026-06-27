import React, { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { NotificationsProvider, useNotifications } from './context/NotificationsContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import API from './api'

const ORDER_STATUS_MESSAGES = {
  accepted: {
    title: 'Order Accepted! ✅',
    body: (name) => `${name} has accepted your order and is preparing it.`,
  },
  preparing: {
    title: 'Order Being Prepared 👨‍🍳',
    body: (name) => `${name} is preparing your food now.`,
  },
  out_for_delivery: {
    title: 'Your Order is On Its Way! 🛵',
    body: (name) => `Your order from ${name} is out for delivery.`,
  },
  picked_up: {
    title: 'Rider Picked Up Your Order! 🛵',
    body: (name) => `Your order from ${name} has been picked up.`,
  },
  delivered: {
    title: 'Order Delivered! 🎉',
    body: (name) => `Your order from ${name} has arrived. Enjoy your meal!`,
  },
}

function OrderNotificationsPoller() {
  const { isLoggedIn } = useAuth()
  const { addNotification } = useNotifications()
  const prevStatuses = useRef({})
  const initialized = useRef(false)

  useEffect(() => {
    if (!isLoggedIn) return

    const poll = async () => {
      try {
        const res = await API.get('/orders')
        const orders = res.data

        if (!initialized.current) {
          orders.forEach(o => { prevStatuses.current[o.id] = o.status })
          initialized.current = true
          return
        }

        orders.forEach(order => {
          const prev = prevStatuses.current[order.id]
          if (prev !== undefined && prev !== order.status) {
            const msg = ORDER_STATUS_MESSAGES[order.status]
            if (msg) {
              addNotification(
                `order-${order.id}-${order.status}`,
                msg.title,
                msg.body(order.restaurant?.name ?? 'your restaurant')
              )
            }
          }
          prevStatuses.current[order.id] = order.status
        })
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 30000)
    return () => {
      clearInterval(interval)
      initialized.current = false
    }
  }, [isLoggedIn, addNotification])

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
      <OrderNotificationsPoller />
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
      <AppRoutes />
    </NotificationsProvider>
  )
}
