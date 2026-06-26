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

  const getQuantityInCart = (itemId) => {
    const found = cart.find(c => c.id === itemId);
    return found ? found.quantity : 0;
  };

  const renderItem = ({ item }) => {
    const qty = getQuantityInCart(item.id);
    return (
      <View style={[styles.itemCard, !item.available && styles.itemCardUnavailable]}>
        <View style={styles.itemImageBox}>
          <Text style={styles.itemEmoji}>🍽️</Text>
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            {!item.available && (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableBadgeText}>Unavailable</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>€{item.price?.toFixed(2)}</Text>
            {item.available ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
              >
                {qty > 0 ? (
                  <View style={styles.addButtonInner}>
                    <Text style={styles.addButtonQty}>{qty}</Text>
                    <Text style={styles.addButtonPlus}>+</Text>
                  </View>
                ) : (
                  <Text style={styles.addButtonLabel}>Add +</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.addButtonDisabled}>
                <Text style={styles.addButtonDisabledText}>Unavailable</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurant.menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.heroBox}>
              <Text style={styles.heroEmoji}>🍽️</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{restaurant.name}</Text>
              <Text style={styles.headerAddress}>📍 {restaurant.address}</Text>
              <View style={styles.headerMeta}>
                <View style={[styles.statusBadge, { backgroundColor: restaurant.isOpen ? '#22c55e' : '#ef4444' }]}>
                  <Text style={styles.statusBadgeText}>{restaurant.isOpen ? '● Open' : '● Closed'}</Text>
                </View>
                <Text style={styles.headerMetaDot}>·</Text>
                <Text style={styles.headerMetaText}>🕐 25–35 min</Text>
                <Text style={styles.headerMetaDot}>·</Text>
                <Text style={styles.headerMetaText}>🍴 {restaurant.menuItems?.length || 0} items</Text>
              </View>
            </View>
            <Text style={styles.menuLabel}>Menu</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptySubtext}>Check back soon</Text>
          </View>
        }
      />

      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { cart, restaurant })}
        >
          <View style={styles.cartButtonBadge}>
            <Text style={styles.cartButtonBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartButtonText}>View Cart</Text>
          <Text style={styles.cartButtonTotal}>€{cartTotal.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },

  // Header / hero
  header: { backgroundColor: '#1A2744', paddingBottom: 8 },
  backButton: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  heroBox: {
    height: 160, backgroundColor: '#243260',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 64 },
  headerInfo: { padding: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerAddress: { fontSize: 14, color: '#a0aec0', marginBottom: 12 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  headerMetaDot: { color: '#2d3e6e', fontSize: 16 },
  headerMetaText: { fontSize: 13, color: '#a0aec0' },
  menuLabel: {
    fontSize: 18, fontWeight: '700', color: '#fff',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#2d3e6e', marginTop: 4,
  },

  // List
  list: { paddingBottom: 100 },

  // Item cards
  itemCard: {
    flexDirection: 'row', backgroundColor: '#1A2744',
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  itemCardUnavailable: { opacity: 0.5 },
  itemImageBox: {
    width: 90, backgroundColor: '#243260',
    alignItems: 'center', justifyContent: 'center',
  },
  itemEmoji: { fontSize: 36 },
  itemInfo: { flex: 1, padding: 14 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  unavailableBadge: {
    backgroundColor: '#2d3e6e', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  unavailableBadgeText: { fontSize: 10, color: '#6b7db3', fontWeight: '600' },
  itemDesc: { fontSize: 12, color: '#6b7db3', marginBottom: 12, lineHeight: 17 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 17, fontWeight: '800', color: '#F5A623' },
  addButton: {
    backgroundColor: '#F5A623', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 8, minWidth: 72, alignItems: 'center',
  },
  addButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addButtonQty: { fontSize: 14, fontWeight: '800', color: '#1A2744' },
  addButtonPlus: { fontSize: 16, fontWeight: '800', color: '#1A2744' },
  addButtonLabel: { fontSize: 14, fontWeight: '800', color: '#1A2744' },
  addButtonDisabled: {
    backgroundColor: '#1e2d50', borderRadius: 22,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  addButtonDisabledText: { fontSize: 11, color: '#4a5d80', fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: '#6b7db3', fontSize: 14 },

  // Cart bar
  cartButton: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#F5A623', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  cartButtonBadge: {
    backgroundColor: '#1A2744', width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  cartButtonBadgeText: { color: '#F5A623', fontSize: 13, fontWeight: '800' },
  cartButtonText: { fontSize: 16, fontWeight: '800', color: '#1A2744', flex: 1, textAlign: 'center' },
  cartButtonTotal: { fontSize: 16, fontWeight: '800', color: '#1A2744' },
});
