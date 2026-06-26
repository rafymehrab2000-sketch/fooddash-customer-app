import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, ScrollView, Animated
} from 'react-native';
import API from '../services/api';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Sushi', 'Asian'];

const CATEGORY_EMOJIS = {
  All: '🍽️',
  Burgers: '🍔',
  Pizza: '🍕',
  Sushi: '🍣',
  Asian: '🥢',
};

function RestaurantCard({ item, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardEmoji}>🍽️</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isOpen ? '#22c55e' : '#ef4444' }]}>
            <Text style={styles.statusBadgeText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardArrow}>›</Text>
          </View>
          <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.address}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>🍴 {item.menuItems?.length || 0} items</Text>
            <View style={styles.cardMetaDivider} />
            <Text style={styles.cardMetaText}>🕐 25–35 min</Text>
            <View style={styles.cardMetaDivider} />
            <Text style={styles.cardMetaAmber}>€3.50 delivery</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SearchScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const inputRef = useRef(null);

  useEffect(() => {
    fetchRestaurants();
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
    } catch (err) {
      console.error('Failed to fetch restaurants');
    }
    setLoading(false);
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch = search.trim() === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' ||
      r.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const hasQuery = search.trim().length > 0 || activeCategory !== 'All';

  return (
    <View style={styles.container}>
      {/* Search bar + cancel */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search restaurants..."
              placeholderTextColor="#6b7db3"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={styles.pillEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F5A623" style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              item={item}
              onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            hasQuery && filtered.length > 0 ? (
              <Text style={styles.resultsLabel}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              {hasQuery ? (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try a different name or category</Text>
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => { setSearch(''); setActiveCategory('All'); }}
                  >
                    <Text style={styles.resetBtnText}>Clear filters</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.emptyIcon}>🍽️</Text>
                  <Text style={styles.emptyText}>Search restaurants</Text>
                  <Text style={styles.emptySubtext}>Type a name or pick a category above</Text>
                </>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },

  // Header
  header: {
    backgroundColor: '#1A2744',
    paddingTop: 54, paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, marginBottom: 14,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#F5A623',
    paddingHorizontal: 12,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#fff' },
  clearBtn: { padding: 4 },
  clearBtnText: { color: '#6b7db3', fontSize: 14 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  cancelBtnText: { color: '#F5A623', fontSize: 15, fontWeight: '700' },

  // Category pills
  categories: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#243260',
    borderWidth: 1, borderColor: '#2d3e6e',
  },
  pillActive: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 13, fontWeight: '600', color: '#a0aec0' },
  pillTextActive: { color: '#1A2744' },

  // List
  loader: { flex: 1 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 32 },
  resultsLabel: { fontSize: 13, color: '#6b7db3', marginBottom: 10, marginTop: 4 },

  // Cards
  card: {
    backgroundColor: '#1A2744', borderRadius: 18, marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  cardImagePlaceholder: {
    height: 110, backgroundColor: '#243260',
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 44 },
  statusBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#fff', flex: 1 },
  cardArrow: { fontSize: 22, color: '#F5A623', fontWeight: '300' },
  cardAddress: { fontSize: 13, color: '#a0aec0', marginBottom: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 12, color: '#6b7db3' },
  cardMetaAmber: { fontSize: 12, color: '#F5A623' },
  cardMetaDivider: { width: 1, height: 12, backgroundColor: '#2d3e6e', marginHorizontal: 10 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#6b7db3', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  resetBtn: {
    backgroundColor: '#F5A623', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
  },
  resetBtnText: { color: '#1A2744', fontSize: 14, fontWeight: '800' },
});
