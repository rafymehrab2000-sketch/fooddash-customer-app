import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Header / Hero */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>🎭 {user?.role || 'customer'}</Text>
        </View>
      </View>

      {/* Account Info */}
      <Text style={styles.sectionLabel}>Account Info</Text>
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>👤</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || '—'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📧</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#1e3a5f' }]}>
              <Text style={styles.menuIcon}>📦</Text>
            </View>
            <Text style={styles.menuItemText}>My Orders</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#1e3a2f' }]}>
              <Text style={styles.menuIcon}>📍</Text>
            </View>
            <Text style={styles.menuItemText}>Saved Addresses</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#3a2a1e' }]}>
              <Text style={styles.menuIcon}>💳</Text>
            </View>
            <Text style={styles.menuItemText}>Payment Methods</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: '#1A2744', paddingTop: 60, paddingBottom: 32,
    alignItems: 'center',
  },
  avatarWrapper: { marginBottom: 16 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: '#F5A623',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#F5A623',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#1A2744' },
  name: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#a0aec0', marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#243260', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#2d3e6e',
  },
  roleBadgeText: { fontSize: 13, color: '#6b7db3', fontWeight: '600' },

  // Section labels
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#6b7db3',
    textTransform: 'uppercase', letterSpacing: 1,
    marginHorizontal: 20, marginTop: 24, marginBottom: 8,
  },

  // Sections
  section: {
    backgroundColor: '#1A2744', marginHorizontal: 16,
    borderRadius: 20, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#2d3e6e', marginHorizontal: 16 },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIconBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#243260', alignItems: 'center', justifyContent: 'center',
  },
  infoIcon: { fontSize: 18 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#6b7db3', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#fff', fontWeight: '600' },

  // Menu items
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuItemText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  arrow: { fontSize: 22, color: '#F5A623', fontWeight: '300' },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#1A2744', marginHorizontal: 16, marginTop: 20,
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#3d1a1a',
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '700' },
});
