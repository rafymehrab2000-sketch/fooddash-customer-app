import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, RefreshControl
} from 'react-native';
import API from '../services/api';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

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

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardEmoji}>🍽️</Text>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#4CAF50' : '#f44336' }]}>
            <Text style={styles.statusText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress}>📍 {item.address}</Text>
        <Text style={styles.cardItems}>🍴 {item.menuItems?.length || 0} items on menu</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍔 FoodDash</Text>
        <Text style={styles.headerSubtitle}>What are you craving?</Text>
        <TextInput
          style={styles.search}
          placeholder="Search restaurants..."
          placeholderTextColor="#6b7db3"
          value={search}
          onChangeText={setSearch}
        />
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
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: {
    backgroundColor: '#1A2744', padding: 24,
    paddingTop: 50, paddingBottom: 30,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  search: {
    backgroundColor: '#243260', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#2d3e6e',
  },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#1A2744', borderRadius: 16, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  cardIcon: {
    width: 80, backgroundColor: '#243260',
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  statusDot: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardAddress: { fontSize: 13, color: '#a0aec0', marginBottom: 4 },
  cardItems: { fontSize: 12, color: '#6b7db3' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#a0aec0', fontSize: 16 },
});