import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

const MAX_ADDRESS_CHARS = 120;

function FieldStatus({ value, isValid }) {
  if (!value) return null;
  return (
    <Text style={[styles.fieldStatus, isValid ? styles.fieldStatusOk : styles.fieldStatusErr]}>
      {isValid ? '✓' : '✗'}
    </Text>
  );
}

export default function CartScreen({ route, navigation }) {
  const { cart, restaurant } = route.params;
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const addressRef = useRef(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3.50;
  const serviceFee = 0.80;
  const total = subtotal + deliveryFee + serviceFee;

  const isPhoneValid = phone.length >= 7;
  const isAddressValid = address.trim().length >= 5;
  const canOrder = isPhoneValid && isAddressValid;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.headerRestaurantRow}>
          <Text style={styles.headerRestaurantEmoji}>🍽️</Text>
          <Text style={styles.headerSubtitle}>{restaurant.name}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {cart.map((item, index) => (
          <View key={item.id} style={[styles.cartItem, index === cart.length - 1 && styles.cartItemLast]}>
            <View style={styles.cartItemQtyBadge}>
              <Text style={styles.cartItemQtyText}>{item.quantity}</Text>
            </View>
            <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cartItemPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Delivery Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>

        {/* Phone */}
        <View style={[styles.inputWrapper, focusedField === 'phone' && styles.inputWrapperFocused]}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            placeholderTextColor="#6b7db3"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          <FieldStatus value={phone} isValid={isPhoneValid} />
        </View>

        {/* Address */}
        <View style={[styles.inputWrapper, styles.inputWrapperMultiline, focusedField === 'address' && styles.inputWrapperFocused]}>
          <Text style={[styles.inputIcon, { marginTop: 2 }]}>📍</Text>
          <TextInput
            ref={addressRef}
            style={[styles.input, styles.addressInput]}
            placeholder="Delivery address"
            placeholderTextColor="#6b7db3"
            value={address}
            onChangeText={v => v.length <= MAX_ADDRESS_CHARS && setAddress(v)}
            multiline
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        <View style={styles.addressMeta}>
          <Text style={[styles.fieldStatusInline, isAddressValid ? styles.fieldStatusOk : styles.addressHint]}>
            {address.length > 0 ? (isAddressValid ? '✓ Address looks good' : 'Enter a full address') : ''}
          </Text>
          <Text style={styles.charCount}>{address.length}/{MAX_ADDRESS_CHARS}</Text>
        </View>
      </View>

      {/* Price Summary */}
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
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[
          styles.orderButton,
          !canOrder && styles.orderButtonDisabled,
          loading && styles.orderButtonLoading,
        ]}
        onPress={placeOrder}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.orderButtonInner}>
            <ActivityIndicator color="#1A2744" size="small" />
            <Text style={styles.orderButtonText}>Placing order...</Text>
          </View>
        ) : (
          <View style={styles.orderButtonInner}>
            <Text style={styles.orderButtonText}>
              {canOrder ? 'Place Order' : 'Fill in details above'}
            </Text>
            {canOrder && (
              <View style={styles.orderButtonPricePill}>
                <Text style={styles.orderButtonPrice}>€{total.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: '#1A2744', paddingHorizontal: 20,
    paddingTop: 54, paddingBottom: 24,
  },
  backButton: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 10 },
  headerRestaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRestaurantEmoji: { fontSize: 16 },
  headerSubtitle: { fontSize: 14, color: '#F5A623', fontWeight: '600' },

  // Sections
  section: {
    backgroundColor: '#1A2744', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 },

  // Cart items
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2d3e6e',
  },
  cartItemLast: { borderBottomWidth: 0 },
  cartItemQtyBadge: {
    backgroundColor: '#F5A623', width: 26, height: 26,
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  cartItemQtyText: { fontSize: 12, fontWeight: '800', color: '#1A2744' },
  cartItemName: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },
  cartItemPrice: { fontSize: 14, fontWeight: '700', color: '#F5A623' },

  // Inputs
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#2d3e6e',
    paddingHorizontal: 14, marginBottom: 12,
  },
  inputWrapperFocused: {
    borderColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
  },
  inputWrapperMultiline: { alignItems: 'flex-start', paddingTop: 14, marginBottom: 6 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#fff' },
  addressInput: { height: 80, textAlignVertical: 'top' },

  // Field validation
  fieldStatus: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  fieldStatusOk: { color: '#22c55e' },
  fieldStatusErr: { color: '#ef4444' },
  fieldStatusInline: { fontSize: 12, fontWeight: '600' },
  addressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 4 },
  addressHint: { color: '#6b7db3' },
  charCount: { fontSize: 12, color: '#4a5d80' },

  // Price summary
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#1e2d50',
  },
  priceLabel: { fontSize: 14, color: '#a0aec0' },
  priceValue: { fontSize: 14, color: '#fff' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 16, marginTop: 4,
  },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#fff' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#F5A623' },

  // Order button
  orderButton: {
    backgroundColor: '#F5A623', marginHorizontal: 16, marginTop: 20,
    borderRadius: 18, padding: 18,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  orderButtonDisabled: {
    backgroundColor: '#243260', shadowOpacity: 0,
  },
  orderButtonLoading: { opacity: 0.85 },
  orderButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderButtonText: { fontSize: 17, fontWeight: '800', color: '#1A2744' },
  orderButtonPricePill: {
    backgroundColor: '#1A2744', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  orderButtonPrice: { fontSize: 15, fontWeight: '800', color: '#F5A623' },
});
