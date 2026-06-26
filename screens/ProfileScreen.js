import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_ITEMS = [
  { key: 'orders',   icon: '📦', label: 'My Orders',        bg: '#1e3a5f' },
  { key: 'addresses',icon: '📍', label: 'Saved Addresses',  bg: '#1e3a2f' },
  { key: 'payment',  icon: '💳', label: 'Payment Methods',  bg: '#3a2a1e' },
  { key: 'help',     icon: '🛟', label: 'Help & Support',   bg: '#2a1e3a' },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      setEditName(parsed.name || '');
      setEditPhone(parsed.phone || '');
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    const updated = { ...user, name: editName.trim(), phone: editPhone.trim() };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditing(false);
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

  const handleMenuPress = (key) => {
    setActiveItem(key);
    setTimeout(() => setActiveItem(null), 200);
    Alert.alert('Coming Soon', 'This feature is not yet available.');
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
          <TouchableOpacity
            style={styles.editAvatarBtn}
            onPress={() => setEditing(e => !e)}
          >
            <Text style={styles.editAvatarIcon}>{editing ? '✕' : '✏️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>🎭 {user?.role || 'customer'}</Text>
        </View>
      </View>

      {/* Edit Profile Panel */}
      {editing && (
        <View style={styles.editPanel}>
          <Text style={styles.editPanelTitle}>Edit Profile</Text>

          <Text style={styles.editFieldLabel}>Name</Text>
          <View style={styles.editInputWrapper}>
            <Text style={styles.editInputIcon}>👤</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Full name"
              placeholderTextColor="#6b7db3"
              autoFocus
            />
          </View>

          <Text style={styles.editFieldLabel}>Phone</Text>
          <View style={styles.editInputWrapper}>
            <Text style={styles.editInputIcon}>📞</Text>
            <TextInput
              style={styles.editInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone number"
              placeholderTextColor="#6b7db3"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
        {user?.phone ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>📞</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.section}>
        {MENU_ITEMS.map((item, index) => (
          <React.Fragment key={item.key}>
            <TouchableOpacity
              style={[styles.menuItem, activeItem === item.key && styles.menuItemActive]}
              onPress={() => handleMenuPress(item.key)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* App version */}
      <Text style={styles.versionText}>FoodDash v1.0.0</Text>

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
  avatarWrapper: { marginBottom: 16, position: 'relative' },
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
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: -4,
    backgroundColor: '#1A2744', width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F5A623',
  },
  editAvatarIcon: { fontSize: 13 },
  name: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#a0aec0', marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#243260', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#2d3e6e',
  },
  roleBadgeText: { fontSize: 13, color: '#6b7db3', fontWeight: '600' },

  // Edit panel
  editPanel: {
    backgroundColor: '#1A2744', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#F5A623',
  },
  editPanelTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 16 },
  editFieldLabel: {
    fontSize: 11, fontWeight: '700', color: '#6b7db3',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  editInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#2d3e6e',
    paddingHorizontal: 14, marginBottom: 14,
  },
  editInputIcon: { fontSize: 16, marginRight: 10 },
  editInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#fff' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, padding: 14,
    alignItems: 'center', backgroundColor: '#243260',
    borderWidth: 1, borderColor: '#2d3e6e',
  },
  cancelBtnText: { color: '#a0aec0', fontSize: 15, fontWeight: '700' },
  saveBtn: {
    flex: 2, borderRadius: 12, padding: 14,
    alignItems: 'center', backgroundColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#1A2744', fontSize: 15, fontWeight: '800' },

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
  menuItemActive: { backgroundColor: '#243260' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuItemText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  arrow: { fontSize: 22, color: '#F5A623', fontWeight: '300' },

  // Version
  versionText: {
    textAlign: 'center', fontSize: 12, color: '#2d3e6e',
    marginTop: 24, marginBottom: 4,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#1A2744', marginHorizontal: 16, marginTop: 12,
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#3d1a1a',
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '700' },
});
