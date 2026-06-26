import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, RefreshControl, ScrollView
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

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
    } catch (err) {
      console.error('Failed to fetch restaurants');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' ||
      r.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
    >
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
          <View style={styles.cardMetaItem}>
            <Text style={styles.cardMetaText}>🍴 {item.menuItems?.length || 0} items</Text>
          </View>
          <View style={styles.cardMetaDivider} />
          <View style={styles.cardMetaItem}>
            <Text style={styles.cardMetaText}>🕐 25–35 min</Text>
          </View>
          <View style={styles.cardMetaDivider} />
          <View style={styles.cardMetaItem}>
            <Text style={styles.cardMetaAmber}>€3.50 delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🍔 FoodDash</Text>
            <Text style={styles.headerSubtitle}>What are you craving?</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Search restaurants..."
            placeholderTextColor="#6b7db3"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={styles.pillEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F5A623" style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRestaurants(); }}
              tintColor="#F5A623"
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>
              {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} near you
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
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
    backgroundColor: '#1A2744', paddingHorizontal: 20,
    paddingTop: 54, paddingBottom: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F5A623' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#2d3e6e', paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#fff' },
  searchClear: { padding: 4 },
  searchClearText: { color: '#6b7db3', fontSize: 14 },

  // Category pills
  categoriesWrapper: { backgroundColor: '#1A2744', paddingBottom: 16 },
  categories: { paddingHorizontal: 20, gap: 8 },
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
  list: { padding: 16, paddingTop: 8 },
  sectionLabel: { fontSize: 13, color: '#6b7db3', marginBottom: 12, marginTop: 4 },

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
  cardMetaItem: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 12, color: '#6b7db3' },
  cardMetaAmber: { fontSize: 12, color: '#F5A623' },
  cardMetaDivider: { width: 1, height: 12, backgroundColor: '#2d3e6e', marginHorizontal: 10 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#6b7db3', fontSize: 14 },
});
