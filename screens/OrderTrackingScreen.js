import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

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
const ACTIVE_STATUSES = ['accepted', 'preparing', 'ready', 'out_for_delivery'];

function StarRating({ rating, styles }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={styles.star}>
          {i <= full ? '★' : (i === full + 1 && half) ? '½' : '☆'}
        </Text>
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function ETATimer({ startMinutes = 30, styles }) {
  const [minutes, setMinutes] = useState(startMinutes);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMinutes(prev => (prev <= 1 ? 0 : prev - 1));
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (minutes === 0) clearInterval(intervalRef.current);
  }, [minutes]);

  return (
    <View style={styles.etaBox}>
      <Text style={styles.etaLabel}>Estimated arrival</Text>
      <Text style={styles.etaTime}>{minutes}</Text>
      <Text style={styles.etaSubLabel}>{minutes === 0 ? 'Arriving now!' : 'min remaining'}</Text>
    </View>
  );
}

function RiderCard({ rider, styles }) {
  const name = rider?.name || 'Your Rider';
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={styles.riderCard}>
      <View style={styles.riderTop}>
        <View style={styles.riderAvatarWrapper}>
          <View style={styles.riderAvatar}>
            <Text style={styles.riderAvatarText}>{initial}</Text>
          </View>
          <View style={styles.riderOnlineDot} />
        </View>
        <View style={styles.riderInfo}>
          <Text style={styles.riderLabel}>Your rider</Text>
          <Text style={styles.riderName}>{name}</Text>
          {rider?.rating != null && <StarRating rating={rider.rating} styles={styles} />}
        </View>
        <ETATimer styles={styles} />
      </View>
      <View style={styles.riderDivider} />
      <View style={styles.riderActions}>
        <TouchableOpacity
          style={styles.riderActionBtn}
          onPress={() => Alert.alert('Call Rider', `Calling ${name}...`)}
        >
          <Text style={styles.riderActionIcon}>📞</Text>
          <Text style={styles.riderActionText}>Call</Text>
        </TouchableOpacity>
        <View style={styles.riderActionDivider} />
        <TouchableOpacity
          style={styles.riderActionBtn}
          onPress={() => Alert.alert('Message Rider', `Opening chat with ${name}...`)}
        >
          <Text style={styles.riderActionIcon}>💬</Text>
          <Text style={styles.riderActionText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OrderTrackingScreen() {
  const { theme } = useTheme();
  const { socket } = useSocket();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data.reverse());
    } catch (err) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => fetchOrders();

    const handleStatusChanged = (data) => {
      const { orderId, status } = data ?? {};
      if (!orderId || !status) return;
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status } : o)
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_changed', handleStatusChanged);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_changed', handleStatusChanged);
    };
  }, [socket, fetchOrders]);

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

      {renderProgressBar(item.status)}

      {ACTIVE_STATUSES.includes(item.status) && (
        <RiderCard rider={item.assignedRider} styles={styles} />
      )}

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

      <View style={styles.cardFooter}>
        <Text style={styles.date}>🗓 {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.total}>€{item.total?.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSubRow}>
          <Text style={styles.headerSubtitle}>Track your deliveries</Text>
          <View style={[styles.liveIndicator, { backgroundColor: socket?.connected ? '#4CAF50' : '#f44336' }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
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
              tintColor={theme.accent}
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

function createStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },

    header: { backgroundColor: t.card, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 24 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: t.accent, marginBottom: 4 },
    headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerSubtitle: { fontSize: 15, color: t.textFaint2 },
    liveIndicator: { width: 8, height: 8, borderRadius: 4 },

    loader: { flex: 1 },
    list: { padding: 16, paddingTop: 8 },
    listLabel: { fontSize: 13, color: t.textMuted, marginBottom: 12, marginTop: 4 },

    card: {
      backgroundColor: t.card, borderRadius: 20, padding: 20, marginBottom: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    orderId: { fontSize: 16, fontWeight: '800', color: t.text, marginBottom: 3 },
    restaurantName: { fontSize: 13, color: t.textSub },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusEmoji: { fontSize: 13 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    progressStepWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: t.border },
    progressDotActive: { backgroundColor: t.accent },
    progressDotCurrent: {
      width: 14, height: 14, borderRadius: 7, backgroundColor: t.accent,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
    },
    progressLine: { flex: 1, height: 2, backgroundColor: t.border },
    progressLineActive: { backgroundColor: t.accent },

    riderCard: { backgroundColor: t.bg, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    riderTop: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    riderAvatarWrapper: { position: 'relative' },
    riderAvatar: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
    },
    riderAvatarText: { fontSize: 20, fontWeight: '800', color: t.accentText },
    riderOnlineDot: {
      position: 'absolute', bottom: 1, right: 1,
      width: 12, height: 12, borderRadius: 6,
      backgroundColor: t.good, borderWidth: 2, borderColor: t.bg,
    },
    riderInfo: { flex: 1 },
    riderLabel: { fontSize: 11, color: t.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    riderName: { fontSize: 15, fontWeight: '800', color: t.text, marginBottom: 4 },
    starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
    star: { fontSize: 13, color: t.accent },
    ratingValue: { fontSize: 12, color: t.textSub, marginLeft: 4 },

    etaBox: { alignItems: 'center', minWidth: 80 },
    etaLabel: { fontSize: 10, color: t.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    etaTime: { fontSize: 22, fontWeight: '800', color: t.accent, fontVariant: ['tabular-nums'] },
    etaSubLabel: { fontSize: 10, color: t.textMuted, marginTop: 2, textAlign: 'center' },

    riderDivider: { height: 1, backgroundColor: t.border, marginHorizontal: 14 },
    riderActions: { flexDirection: 'row' },
    riderActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    riderActionDivider: { width: 1, backgroundColor: t.border, marginVertical: 10 },
    riderActionIcon: { fontSize: 18 },
    riderActionText: { fontSize: 14, fontWeight: '700', color: t.text },

    itemsSection: { backgroundColor: t.bg, borderRadius: 12, paddingHorizontal: 14, marginBottom: 16 },
    itemRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.borderDark,
    },
    itemRowLast: { borderBottomWidth: 0 },
    itemQtyBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: t.cardAlt, alignItems: 'center', justifyContent: 'center' },
    itemQtyText: { fontSize: 11, fontWeight: '700', color: t.accent },
    itemText: { flex: 1, fontSize: 13, color: t.textSub },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: t.border, paddingTop: 14 },
    date: { fontSize: 13, color: t.textMuted },
    total: { fontSize: 17, fontWeight: '800', color: t.accent },

    empty: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyText: { fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: t.textMuted },
  });
}
