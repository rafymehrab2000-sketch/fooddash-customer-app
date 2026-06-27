import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://fooddash-food-delivery-project-production.up.railway.app';
const SocketContext = createContext(null);

export function SocketProvider({ isLoggedIn, children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setSocket(prev => { prev?.disconnect(); return null; });
      setConnected(false);
      setUserId(null);
      return;
    }

    let s = null;
    let cancelled = false;

    AsyncStorage.multiGet(['token', 'user']).then(([[, token], [, userRaw]]) => {
      if (cancelled) return;

      const user = userRaw ? JSON.parse(userRaw) : null;
      if (user?.id) setUserId(user.id);

      s = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      s.on('connect', () => { if (!cancelled) setConnected(true); });
      s.on('disconnect', () => { if (!cancelled) setConnected(false); });

      if (!cancelled) setSocket(s);
    }).catch(console.error);

    return () => {
      cancelled = true;
      s?.disconnect();
      setSocket(null);
      setConnected(false);
      setUserId(null);
    };
  }, [isLoggedIn]);

  return (
    <SocketContext.Provider value={{ socket, connected, userId }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
