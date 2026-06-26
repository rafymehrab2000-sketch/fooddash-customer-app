import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    icon: '🛵',
    title: 'Order out for delivery',
    body: 'Your order from Burger Palace is on its way! ETA 12 min.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'order',
    icon: '✅',
    title: 'Order confirmed',
    body: 'Sushi Garden has accepted your order and is now preparing it.',
    time: '18 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'promo',
    icon: '🎁',
    title: '20% off your next order',
    body: 'Use code DASH20 at checkout. Valid until end of this week.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '4',
    type: 'order',
    icon: '🎉',
    title: 'Order delivered!',
    body: 'Your order from Pizza Roma has been delivered. Enjoy your meal!',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'promo',
    icon: '⭐',
    title: 'New restaurant nearby',
    body: 'Asian Garden just joined FoodDash. Check out their menu!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    icon: '📢',
    title: 'Welcome to FoodDash!',
    body: 'Browse restaurants, add items to cart and get food delivered to your door.',
    time: '2 days ago',
    read: true,
  },
];

const TYPE_COLORS = {
  order: '#2196F3',
  promo: '#F5A623',
  system: '#9C27B0',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBox, { backgroundColor: TYPE_COLORS[item.type] + '22' }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },

  header: {
    backgroundColor: '#1A2744', paddingHorizontal: 20,
    paddingTop: 54, paddingBottom: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  markAllBtn: {
    backgroundColor: '#243260', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#2d3e6e',
  },
  markAllText: { fontSize: 12, fontWeight: '700', color: '#F5A623' },

  list: { paddingVertical: 8 },

  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#0f1a33',
  },
  itemUnread: { backgroundColor: '#111e38' },

  iconBox: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  iconText: { fontSize: 22 },
  unreadDot: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#F5A623', borderWidth: 2, borderColor: '#0f1a33',
  },

  textBlock: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '600', color: '#a0aec0', flex: 1, marginRight: 8 },
  titleUnread: { color: '#fff', fontWeight: '700' },
  time: { fontSize: 11, color: '#4a5d80', flexShrink: 0 },
  body: { fontSize: 13, color: '#6b7db3', lineHeight: 19 },

  separator: { height: 1, backgroundColor: '#1e2d50', marginHorizontal: 20 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7db3' },
});
