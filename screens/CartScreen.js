import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

const MAX_ADDRESS_CHARS = 120;

function FieldStatus({ value, isValid, styles }) {
  if (!value) return null;
  return (
    <Text style={[styles.fieldStatus, isValid ? styles.fieldStatusOk : styles.fieldStatusErr]}>
      {isValid ? '✓' : '✗'}
    </Text>
  );
}

export default function CartScreen({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        subtotal, deliveryFee, serviceFee, total,
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <View style={[styles.inputWrapper, focusedField === 'phone' && styles.inputWrapperFocused]}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          <FieldStatus value={phone} isValid={isPhoneValid} styles={styles} />
        </View>

        <View style={[styles.inputWrapper, styles.inputWrapperMultiline, focusedField === 'address' && styles.inputWrapperFocused]}>
          <Text style={[styles.inputIcon, { marginTop: 2 }]}>📍</Text>
          <TextInput
            ref={addressRef}
            style={[styles.input, styles.addressInput]}
            placeholder="Delivery address"
            placeholderTextColor={theme.textMuted}
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

      <TouchableOpacity
        style={[styles.orderButton, !canOrder && styles.orderButtonDisabled, loading && styles.orderButtonLoading]}
        onPress={placeOrder}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.orderButtonInner}>
            <ActivityIndicator color={theme.accentText} size="small" />
            <Text style={styles.orderButtonText}>Placing order...</Text>
          </View>
        ) : (
          <View style={styles.orderButtonInner}>
            <Text style={[styles.orderButtonText, !canOrder && styles.orderButtonTextDisabled]}>
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
    </KeyboardAvoidingView>
  );
}

function createStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    scrollContent: { paddingBottom: 40 },

    header: { backgroundColor: t.card, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 24 },
    backButton: { marginBottom: 16 },
    backText: { color: t.textFaint2, fontSize: 16 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: t.text, marginBottom: 10 },
    headerRestaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerRestaurantEmoji: { fontSize: 16 },
    headerSubtitle: { fontSize: 14, color: t.accent, fontWeight: '600' },

    section: { backgroundColor: t.card, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: t.text, marginBottom: 16 },

    cartItem: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.border,
    },
    cartItemLast: { borderBottomWidth: 0 },
    cartItemQtyBadge: { backgroundColor: t.accent, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    cartItemQtyText: { fontSize: 12, fontWeight: '800', color: t.accentText },
    cartItemName: { flex: 1, fontSize: 14, color: t.text, fontWeight: '500' },
    cartItemPrice: { fontSize: 14, fontWeight: '700', color: t.accent },

    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.inputBg, borderRadius: 14,
      borderWidth: 1, borderColor: t.inputBorder,
      paddingHorizontal: 14, marginBottom: 12,
    },
    inputWrapperFocused: {
      borderColor: t.accent,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
    },
    inputWrapperMultiline: { alignItems: 'flex-start', paddingTop: 14, marginBottom: 6 },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: t.text },
    addressInput: { height: 80, textAlignVertical: 'top' },

    fieldStatus: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
    fieldStatusOk: { color: t.good },
    fieldStatusErr: { color: t.bad },
    fieldStatusInline: { fontSize: 12, fontWeight: '600' },
    addressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 4 },
    addressHint: { color: t.textMuted },
    charCount: { fontSize: 12, color: t.textDim },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: t.borderDark },
    priceLabel: { fontSize: 14, color: t.textSub },
    priceValue: { fontSize: 14, color: t.text },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 4 },
    totalLabel: { fontSize: 17, fontWeight: '800', color: t.text },
    totalValue: { fontSize: 17, fontWeight: '800', color: t.accent },

    orderButton: {
      backgroundColor: t.accent, marginHorizontal: 16, marginTop: 20,
      borderRadius: 18, padding: 18,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    orderButtonDisabled: { backgroundColor: t.inputBg, shadowOpacity: 0 },
    orderButtonLoading: { opacity: 0.85 },
    orderButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orderButtonText: { fontSize: 17, fontWeight: '800', color: t.accentText },
    orderButtonTextDisabled: { color: t.textMuted },
    orderButtonPricePill: { backgroundColor: t.accentText, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    orderButtonPrice: { fontSize: 15, fontWeight: '800', color: t.accent },
  });
}
