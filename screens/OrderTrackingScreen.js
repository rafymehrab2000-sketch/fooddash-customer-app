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

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

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

  const renderProgressBar = (status) => {
    if (status === 'cancelled') return null;
    const currentStep = STATUS_STEPS.indexOf(status);
    return (
      <View style={styles.progressRow}>
        {STATUS_STEPS.map((step, index) => (
          <View key={step} style={styles.progressStepWrapper}>
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
              index === currentStep && styles.progressDotCurrent,
            ]} />
            {index < STATUS_STEPS.length - 1 && (
              <View style={[styles.progressLine, index < currentStep && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.restaurantName}>{item.restaurant?.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
          <Text style={styles.statusText}>{item.status?.replace('_', ' ')}</Text>
        </View>
      </View>

      {/* Progress bar */}
      {renderProgressBar(item.status)}

      {/* Items */}
      <View style={styles.itemsSection}>
        {item.orderItems?.map((orderItem, index) => (
          <View key={orderItem.id} style={[styles.itemRow, index === item.orderItems.length - 1 && styles.itemRowLast]}>
            <View style={styles.itemQtyBadge}>
              <Text style={styles.itemQtyText}>{orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemText} numberOfLines={1}>{orderItem.menuItem?.name}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          🗓 {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.total}>€{item.total?.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
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
          ListHeaderComponent={
            orders.length > 0 && (
              <Text style={styles.listLabel}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
            )
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

  // Header
  header: {
    backgroundColor: '#1A2744', paddingHorizontal: 20,
    paddingTop: 54, paddingBottom: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)' },

  loader: { flex: 1 },

  // List
  list: { padding: 16, paddingTop: 8 },
  listLabel: { fontSize: 13, color: '#6b7db3', marginBottom: 12, marginTop: 4 },

  // Cards
  card: {
    backgroundColor: '#1A2744', borderRadius: 20, padding: 20,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  orderId: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 3 },
  restaurantName: { fontSize: 13, color: '#a0aec0' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  statusEmoji: { fontSize: 13 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

  // Progress bar
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16,
  },
  progressStepWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2d3e6e',
  },
  progressDotActive: { backgroundColor: '#F5A623' },
  progressDotCurrent: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
  progressLine: { flex: 1, height: 2, backgroundColor: '#2d3e6e' },
  progressLineActive: { backgroundColor: '#F5A623' },

  // Items
  itemsSection: {
    backgroundColor: '#0f1a33', borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e2d50',
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemQtyBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#243260', alignItems: 'center', justifyContent: 'center',
  },
  itemQtyText: { fontSize: 11, fontWeight: '700', color: '#F5A623' },
  itemText: { flex: 1, fontSize: 13, color: '#a0aec0' },

  // Footer
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#2d3e6e', paddingTop: 14,
  },
  date: { fontSize: 13, color: '#6b7db3' },
  total: { fontSize: 17, fontWeight: '800', color: '#F5A623' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7db3' },
});
