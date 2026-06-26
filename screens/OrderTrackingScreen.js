import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl
} from 'react-native';
import API from '../services/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#ff9800';
    case 'accepted': return '#2196F3';
    case 'preparing': return '#9C27B0';
    case 'ready': return '#00BCD4';
    case 'out_for_delivery': return '#00BCD4';
    case 'delivered': return '#4CAF50';
    case 'cancelled': return '#f44336';
    default: return '#888';
  }
};

const getStatusEmoji = (status) => {
  switch (status) {
    case 'pending': return '⏳';
    case 'accepted': return '✅';
    case 'preparing': return '👨‍🍳';
    case 'ready': return '📦';
    case 'out_for_delivery': return '🛵';
    case 'delivered': return '🎉';
    case 'cancelled': return '❌';
    default: return '📋';
  }
};

export default function OrderTrackingScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data.reverse());
    } catch (err) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusEmoji(item.status)} {item.status?.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <Text style={styles.restaurantName}>{item.restaurant?.name}</Text>

      <View style={styles.items}>
        {item.orderItems?.map(orderItem => (
          <Text key={orderItem.id} style={styles.itemText}>
            • {orderItem.quantity}x {orderItem.menuItem?.name}
          </Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.total}>€{item.total?.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧾 My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your deliveries</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F5A623" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrders(); }}
              tintColor="#F5A623"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>Your orders will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: { backgroundColor: '#1A2744', padding: 24, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  loader: { flex: 1 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#1A2744', borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#fff' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  restaurantName: { fontSize: 14, color: '#a0aec0', marginBottom: 12 },
  items: { marginBottom: 12 },
  itemText: { fontSize: 13, color: '#a0aec0', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2d3e6e', paddingTop: 12 },
  date: { fontSize: 13, color: '#6b7db3' },
  total: { fontSize: 15, fontWeight: '700', color: '#F5A623' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#a0aec0' },
});