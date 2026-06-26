import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Animated, ScrollView, TextInput
} from 'react-native';

const MENU_CATEGORIES = ['All', 'Starters', 'Mains', 'Sides', 'Drinks', 'Desserts'];

function MenuItemCard({ item, qty, onAdd, onRemove }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const handleAdd = () => { pulse(); onAdd(item); };

  return (
    <Animated.View style={[styles.itemCard, !item.available && styles.itemCardUnavailable, { transform: [{ scale }] }]}>
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
            qty > 0 ? (
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => onRemove(item)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={handleAdd}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonLabel}>Add +</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.addButtonDisabled}>
              <Text style={styles.addButtonDisabledText}>Unavailable</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (!existing) return;
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.id !== item.id));
    } else {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const getQty = (itemId) => cart.find(c => c.id === itemId)?.quantity || 0;

  const filteredItems = (restaurant.menuItems || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' ||
      item.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            qty={getQty(item.id)}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        )}
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
              <View style={styles.headerRatingRow}>
                {[1,2,3,4,5].map(i => (
                  <Text key={i} style={styles.headerStar}>{i <= 4 ? '★' : '½'}</Text>
                ))}
                <Text style={styles.headerRatingValue}>4.5</Text>
              </View>
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

            {/* Menu search */}
            <View style={[styles.menuSearchWrapper, searchFocused && styles.menuSearchFocused]}>
              <Text style={styles.menuSearchIcon}>🔍</Text>
              <TextInput
                style={styles.menuSearch}
                placeholder="Search menu..."
                placeholderTextColor="#6b7db3"
                value={search}
                onChangeText={setSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.menuSearchClear}>
                  <Text style={styles.menuSearchClearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {MENU_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, activeCategory === cat && styles.pillActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.menuLabelRow}>
              <Text style={styles.menuLabel}>Menu</Text>
              <Text style={styles.menuCount}>{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Try a different search or category</Text>
            {(search || activeCategory !== 'All') && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { setSearch(''); setActiveCategory('All'); }}
              >
                <Text style={styles.resetBtnText}>Clear filters</Text>
              </TouchableOpacity>
            )}
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
  headerRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  headerStar: { fontSize: 14, color: '#F5A623' },
  headerRatingValue: { fontSize: 13, color: '#a0aec0', marginLeft: 6, fontWeight: '600' },
  headerAddress: { fontSize: 14, color: '#a0aec0', marginBottom: 12 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  headerMetaDot: { color: '#2d3e6e', fontSize: 16 },
  headerMetaText: { fontSize: 13, color: '#a0aec0' },

  // Menu search
  menuSearchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#2d3e6e',
    marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14,
  },
  menuSearchFocused: {
    borderColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
  },
  menuSearchIcon: { fontSize: 15, marginRight: 8 },
  menuSearch: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#fff' },
  menuSearchClear: { padding: 4 },
  menuSearchClearText: { color: '#6b7db3', fontSize: 13 },

  // Category pills
  categoryRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#243260',
    borderWidth: 1, borderColor: '#2d3e6e',
  },
  pillActive: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#a0aec0' },
  pillTextActive: { color: '#1A2744' },

  // Menu label
  menuLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#2d3e6e', marginTop: 12,
  },
  menuLabel: { fontSize: 18, fontWeight: '800', color: '#fff' },
  menuCount: { fontSize: 13, color: '#6b7db3' },

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

  // Add button
  addButton: {
    backgroundColor: '#F5A623', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 8, minWidth: 72, alignItems: 'center',
  },
  addButtonLabel: { fontSize: 14, fontWeight: '800', color: '#1A2744' },
  addButtonDisabled: {
    backgroundColor: '#1e2d50', borderRadius: 22,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  addButtonDisabledText: { fontSize: 11, color: '#4a5d80', fontWeight: '600' },

  // Qty stepper
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 22,
    borderWidth: 1, borderColor: '#F5A623',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { fontSize: 18, fontWeight: '800', color: '#F5A623' },
  qtyValue: { fontSize: 14, fontWeight: '800', color: '#fff', minWidth: 20, textAlign: 'center' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: '#6b7db3', fontSize: 14, marginBottom: 20 },
  resetBtn: {
    backgroundColor: '#F5A623', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
  },
  resetBtnText: { color: '#1A2744', fontSize: 14, fontWeight: '800' },

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
