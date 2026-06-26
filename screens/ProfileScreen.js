import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>👤 Name</Text>
          <Text style={styles.rowValue}>{user?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>📧 Email</Text>
          <Text style={styles.rowValue}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>🎭 Role</Text>
          <Text style={styles.rowValue}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>📦 My Orders</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>📍 Saved Addresses</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>💳 Payment Methods</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: {
    backgroundColor: '#1A2744', padding: 24,
    paddingTop: 50, alignItems: 'center', paddingBottom: 40,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F5A623',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#1A2744' },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  section: {
    backgroundColor: '#1A2744', margin: 16, marginBottom: 0,
    borderRadius: 16, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#2d3e6e',
  },
  rowLabel: { fontSize: 14, color: '#6b7db3' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#2d3e6e',
  },
  menuItemText: { fontSize: 15, color: '#a0aec0' },
  arrow: { fontSize: 16, color: '#6b7db3' },
  logoutButton: {
    backgroundColor: '#1A2744', margin: 16, marginTop: 16,
    borderRadius: 16, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#3d1a1a',
  },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '600' },
});