import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    Alert.alert('Added!', `${item.name} added to cart`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description || 'No description'}</Text>
        <Text style={styles.itemPrice}>€{item.price?.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, !item.available && styles.addButtonDisabled]}
        onPress={() => item.available && addToCart(item)}
      >
        <Text style={styles.addButtonText}>{item.available ? '+' : '✗'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <Text style={styles.headerAddress}>📍 {restaurant.address}</Text>
      </View>

      <FlatList
        data={restaurant.menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No menu items yet</Text>
          </View>
        }
      />

      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { cart, restaurant })}
        >
          <Text style={styles.cartButtonText}>
            🛒 View Cart ({cartCount} items) — €{cartTotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: {
    backgroundColor: '#1A2744', padding: 24, paddingTop: 50,
  },
  backButton: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#F5A623', marginBottom: 4 },
  headerAddress: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  list: { padding: 16 },
  itemCard: {
    backgroundColor: '#1A2744', borderRadius: 12, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#a0aec0', marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#F5A623' },
  addButton: {
    backgroundColor: '#F5A623', width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  addButtonDisabled: { backgroundColor: '#2d3e6e' },
  addButtonText: { color: '#1A2744', fontSize: 24, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#a0aec0', fontSize: 16 },
  cartButton: {
    backgroundColor: '#F5A623', margin: 16, padding: 18,
    borderRadius: 16, alignItems: 'center',
  },
  cartButtonText: { color: '#1A2744', fontSize: 16, fontWeight: '700' },
});