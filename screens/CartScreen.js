import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function CartScreen({ route, navigation }) {
  const { cart, restaurant } = route.params;
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3.50;
  const serviceFee = 0.80;
  const total = subtotal + deliveryFee + serviceFee;

  const placeOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Error', 'Please fill in your address and phone number');
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);

      await API.post('/orders', {
        restaurantId: restaurant.id,
        customerName: user.name,
        customerPhone: phone,
        customerAddress: address,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      });

      Alert.alert(
        '🎉 Order Placed!',
        'Your order has been placed successfully!',
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Your Cart</Text>
        <Text style={styles.headerSubtitle}>{restaurant.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {cart.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.cartItemName}>{item.quantity}x {item.name}</Text>
            <Text style={styles.cartItemPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Your phone number"
          placeholderTextColor="#6b7db3"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Delivery address"
          placeholderTextColor="#6b7db3"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Summary</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>€{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery fee</Text>
          <Text style={styles.priceValue}>€{deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Service fee</Text>
          <Text style={styles.priceValue}>€{serviceFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.orderButton}
        onPress={placeOrder}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#1A2744" />
          : <Text style={styles.orderButtonText}>Place Order — €{total.toFixed(2)}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: { backgroundColor: '#1A2744', padding: 24, paddingTop: 50 },
  backButton: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  section: {
    backgroundColor: '#1A2744', margin: 16, marginBottom: 0,
    borderRadius: 16, padding: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2d3e6e' },
  cartItemName: { fontSize: 14, color: '#a0aec0' },
  cartItemPrice: { fontSize: 14, fontWeight: '600', color: '#F5A623' },
  input: {
    backgroundColor: '#243260', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#2d3e6e',
  },
  addressInput: { height: 80, textAlignVertical: 'top' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#a0aec0' },
  priceValue: { fontSize: 14, color: '#fff' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#2d3e6e', marginTop: 8, paddingTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#F5A623' },
  orderButton: {
    backgroundColor: '#F5A623', margin: 16, padding: 18,
    borderRadius: 16, alignItems: 'center', marginBottom: 40,
  },
  orderButtonText: { color: '#1A2744', fontSize: 16, fontWeight: '700' },
});