import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  const addToCart = useCallback((item, rest) => {
    if (restaurant && rest.id !== restaurant.id && items.length > 0) {
      Alert.alert(
        'Start new cart?',
        `Your cart has items from ${restaurant.name}. Clear it to add from ${rest.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear & Add',
            style: 'destructive',
            onPress: () => {
              setRestaurant(rest);
              setItems([{ ...item, quantity: 1 }]);
            },
          },
        ]
      );
      return;
    }
    setRestaurant(rest);
    setItems(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, [restaurant, items]);

  const removeFromCart = useCallback((item) => {
    setItems(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        const next = prev.filter(c => c.id !== item.id);
        if (next.length === 0) setRestaurant(null);
        return next;
      }
      return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurant(null);
  }, []);

  const getQty = useCallback((itemId) => items.find(c => c.id === itemId)?.quantity || 0, [items]);

  const cartCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const cartTotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = useMemo(() => ({
    items, restaurant, addToCart, removeFromCart, clearCart, getQty, cartCount, cartTotal,
  }), [items, restaurant, addToCart, removeFromCart, clearCart, getQty, cartCount, cartTotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
