import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL = 'https://fooddash-food-delivery-project-production.up.railway.app'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      setSocket(prev => { prev?.disconnect(); return null })
      setConnected(false)
      return
    }

    const token = localStorage.getItem('token')
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [isLoggedIn])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
