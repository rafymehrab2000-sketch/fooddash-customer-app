import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { Animated, Text, StyleSheet, Platform, View } from 'react-native';

const ToastContext = createContext(null);
let _idCounter = 0;

const COLORS = {
  info:    '#2196F3',
  success: '#4CAF50',
  warning: '#ff9800',
  error:   '#f44336',
};

function ToastItem({ toast, onRemove }) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start(() => onRemove(toast.id));
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: COLORS[toast.type] || COLORS.info },
        { transform: [{ translateY }], opacity },
      ]}
    >
      {toast.title ? <Text style={styles.title}>{toast.title}</Text> : null}
      {toast.body ? <Text style={styles.body}>{toast.body}</Text> : null}
    </Animated.View>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, body, type = 'info') => {
    const id = ++_idCounter;
    setToasts(prev => [...prev.slice(-3), { id, title, body, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 12,
    right: 12,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  body: { fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 18 },
});
