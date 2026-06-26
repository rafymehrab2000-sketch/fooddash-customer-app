import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Sushi', 'Asian'];

const CATEGORY_EMOJIS = {
  All: '🍽️', Burgers: '🍔', Pizza: '🍕', Sushi: '🍣', Asian: '🥢',
};

const SORT_OPTIONS = ['Default', 'Open first', 'Most items'];

function RestaurantCard({ item, onPress, styles }) {
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

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('Default');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchRestaurants();
    loadGreeting();
  }, []);

  const loadGreeting = async () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name?.split(' ')[0] || '');
    }
  };

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

  const filtered = restaurants
    .filter(r => {
      const matchesCategory = activeCategory === 'All' ||
        r.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesCategory;
    })
    .sort((a, b) => {
      if (activeSort === 'Open first') return (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0);
      if (activeSort === 'Most items') return (b.menuItems?.length || 0) - (a.menuItems?.length || 0);
      return 0;
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>Jyväskylä, Finland</Text>
          <Text style={styles.locationArrow}>▾</Text>
        </TouchableOpacity>

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>{greeting}{userName ? `, ${userName}` : ''} 👋</Text>
            <Text style={styles.headerTitle}>What are you craving?</Text>
          </View>
        </View>

        {/* Search shortcut */}
        <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search restaurants...</Text>
        </TouchableOpacity>
      </View>

      {/* Featured */}
      {!loading && restaurants.length > 0 && (
        <View style={styles.featuredSection}>
          <Text style={styles.featuredLabel}>Featured</Text>
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Restaurant', { restaurant: restaurants[0] })}
          >
            <View style={styles.featuredImageBox}>
              <Text style={styles.featuredEmoji}>🌟</Text>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
              </View>
              <View style={[styles.featuredStatusBadge, { backgroundColor: restaurants[0].isOpen ? '#22c55e' : '#ef4444' }]}>
                <Text style={styles.featuredStatusText}>{restaurants[0].isOpen ? 'Open' : 'Closed'}</Text>
              </View>
            </View>
            <View style={styles.featuredBody}>
              <Text style={styles.featuredName}>{restaurants[0].name}</Text>
              <Text style={styles.featuredAddress} numberOfLines={1}>📍 {restaurants[0].address}</Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredMetaText}>🍴 {restaurants[0].menuItems?.length || 0} items</Text>
                <Text style={styles.featuredMetaDot}>·</Text>
                <Text style={styles.featuredMetaText}>🕐 25–35 min</Text>
                <Text style={styles.featuredMetaDot}>·</Text>
                <Text style={styles.featuredMetaAmber}>€3.50 delivery</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
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
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              item={item}
              styles={styles}
              onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRestaurants(); }}
              tintColor={theme.accent}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>
                {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} near you
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.sortPill, activeSort === opt && styles.sortPillActive]}
                    onPress={() => setActiveSort(opt)}
                  >
                    <Text style={[styles.sortPillText, activeSort === opt && styles.sortPillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>Try a different category</Text>
              {activeCategory !== 'All' && (
                <TouchableOpacity style={styles.resetBtn} onPress={() => setActiveCategory('All')}>
                  <Text style={styles.resetBtnText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

function createStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },

    header: { backgroundColor: t.card, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 20 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    locationPin: { fontSize: 14 },
    locationText: { fontSize: 14, fontWeight: '700', color: t.text, flex: 1 },
    locationArrow: { fontSize: 14, color: t.accent, fontWeight: '700' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    headerGreeting: { fontSize: 13, color: t.textFaint, marginBottom: 4 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: t.text },
    searchContainer: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.inputBg, borderRadius: 14,
      borderWidth: 1, borderColor: t.inputBorder,
      paddingHorizontal: 14, paddingVertical: 13,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchPlaceholder: { fontSize: 15, color: t.textMuted, flex: 1 },

    featuredSection: { backgroundColor: t.card, paddingHorizontal: 20, paddingBottom: 16 },
    featuredLabel: { fontSize: 12, fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    featuredCard: {
      backgroundColor: t.cardAlt, borderRadius: 18, overflow: 'hidden',
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
    },
    featuredImageBox: { height: 130, backgroundColor: t.borderDark, alignItems: 'center', justifyContent: 'center' },
    featuredEmoji: { fontSize: 52 },
    featuredBadge: {
      position: 'absolute', top: 10, left: 10,
      backgroundColor: t.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    featuredBadgeText: { fontSize: 11, fontWeight: '800', color: t.accentText },
    featuredStatusBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    featuredStatusText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    featuredBody: { padding: 14 },
    featuredName: { fontSize: 17, fontWeight: '800', color: t.text, marginBottom: 4 },
    featuredAddress: { fontSize: 13, color: t.textSub, marginBottom: 10 },
    featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featuredMetaText: { fontSize: 12, color: t.textMuted },
    featuredMetaDot: { fontSize: 12, color: t.border },
    featuredMetaAmber: { fontSize: 12, color: t.accent },

    categoriesWrapper: { backgroundColor: t.card, paddingBottom: 16 },
    categories: { paddingHorizontal: 20, gap: 8 },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, backgroundColor: t.cardAlt,
      borderWidth: 1, borderColor: t.border,
    },
    pillActive: { backgroundColor: t.accent, borderColor: t.accent },
    pillEmoji: { fontSize: 14 },
    pillText: { fontSize: 13, fontWeight: '600', color: t.textSub },
    pillTextActive: { color: t.accentText },

    loader: { flex: 1 },
    list: { padding: 16, paddingTop: 8 },
    listHeader: { marginBottom: 4 },
    sectionLabel: { fontSize: 13, color: t.textMuted, marginBottom: 10, marginTop: 4 },

    sortRow: { gap: 8, paddingBottom: 12 },
    sortPill: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
    },
    sortPillActive: { borderColor: t.accent },
    sortPillText: { fontSize: 12, fontWeight: '600', color: t.textMuted },
    sortPillTextActive: { color: t.accent },

    card: {
      backgroundColor: t.card, borderRadius: 18, marginBottom: 16, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
    },
    cardImagePlaceholder: { height: 110, backgroundColor: t.cardAlt, alignItems: 'center', justifyContent: 'center' },
    cardEmoji: { fontSize: 44 },
    statusBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    cardBody: { padding: 16 },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    cardName: { fontSize: 17, fontWeight: '700', color: t.text, flex: 1 },
    cardArrow: { fontSize: 22, color: t.accent, fontWeight: '300' },
    cardAddress: { fontSize: 13, color: t.textSub, marginBottom: 12 },
    cardMeta: { flexDirection: 'row', alignItems: 'center' },
    cardMetaText: { fontSize: 12, color: t.textMuted },
    cardMetaAmber: { fontSize: 12, color: t.accent },
    cardMetaDivider: { width: 1, height: 12, backgroundColor: t.border, marginHorizontal: 10 },

    empty: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: t.text, fontSize: 18, fontWeight: '600', marginBottom: 8 },
    emptySubtext: { color: t.textMuted, fontSize: 14, marginBottom: 20 },
    resetBtn: { backgroundColor: t.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
    resetBtnText: { color: t.accentText, fontSize: 14, fontWeight: '800' },
  });
}
