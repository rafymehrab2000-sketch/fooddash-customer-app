import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';

function formatTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.75}
    >
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🔔</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatTime(item.time)}</Text>
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
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>Order updates and alerts will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

function createStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },

    header: {
      backgroundColor: t.card, paddingHorizontal: 20,
      paddingTop: 54, paddingBottom: 24,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    headerTitle: { fontSize: 28, fontWeight: '800', color: t.accent, marginBottom: 4 },
    headerSubtitle: { fontSize: 15, color: t.textFaint2 },
    markAllBtn: {
      backgroundColor: t.cardAlt, paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1, borderColor: t.border,
    },
    markAllText: { fontSize: 12, fontWeight: '700', color: t.accent },

    list: { paddingVertical: 8 },

    item: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 14,
      paddingHorizontal: 20, paddingVertical: 16,
      backgroundColor: t.bg,
    },
    itemUnread: { backgroundColor: t.unreadBg },

    iconBox: {
      width: 46, height: 46, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: t.accent + '22',
      position: 'relative', flexShrink: 0,
    },
    iconText: { fontSize: 22 },
    unreadDot: {
      position: 'absolute', top: -2, right: -2,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: t.accent, borderWidth: 2, borderColor: t.bg,
    },

    textBlock: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 14, fontWeight: '600', color: t.textSub, flex: 1, marginRight: 8 },
    titleUnread: { color: t.text, fontWeight: '700' },
    time: { fontSize: 11, color: t.textDim, flexShrink: 0 },
    body: { fontSize: 13, color: t.textMuted, lineHeight: 19 },

    separator: { height: 1, backgroundColor: t.borderDark, marginHorizontal: 20 },

    empty: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyText: { fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: t.textMuted, textAlign: 'center', paddingHorizontal: 32 },
  });
}
