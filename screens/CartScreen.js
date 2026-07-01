import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

function FieldStatus({ value, isValid, styles }) {
  if (!value) return null;
  return (
    <Text style={[styles.fieldStatus, isValid ? styles.fieldStatusOk : styles.fieldStatusErr]}>
      {isValid ? '✓' : '✗'}
    </Text>
  );
}

export default function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { items: cart, restaurant, clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [payFocused, setPayFocused] = useState(null);

  const expiryRef = useRef(null);
  const cvvRef = useRef(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3.50;
  const serviceFee = 0.80;
  const total = subtotal + deliveryFee + serviceFee;

  const isPhoneValid = phone.length >= 7;
  const isAddressValid = address.trim().length >= 5;
  const isEntranceValid = entrance.trim().length > 0;
  const isFloorValid = floor.trim().length > 0;
  const isApartmentValid = apartment.trim().length > 0;
  const canOrder = isPhoneValid && isAddressValid && isEntranceValid && isFloorValid && isApartmentValid;

  const handleCardNumberChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  };

  const handleExpiryChange = (text) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setCardExpiry(digits);
    } else {
      setCardExpiry(digits.slice(0, 2) + '/' + digits.slice(2, 4));
    }
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16;
  const isExpiryValid = /^\d{2}\/\d{2}$/.test(cardExpiry);
  const isCvvValid = cardCvv.length >= 3;
  const canPay = isCardValid && isExpiryValid && isCvvValid;

  // Called when the user types in the autocomplete box — clears any previously
  // confirmed selection so the detail fields hide until a new place is picked.
  const clearAddressFields = () => {
    setAddress('');
    setEntrance('');
    setFloor('');
    setApartment('');
    setAdditionalInfo('');
  };

  const openPayment = () => {
    if (!isPhoneValid || !isAddressValid || !isEntranceValid || !isFloorValid || !isApartmentValid) {
      Alert.alert('Error', 'Please fill in all required delivery details');
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await API.post('/payment/create-payment-intent', {
        amount: Math.round(total * 100),
      });
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      await API.post('/orders', {
        restaurantId: restaurant.id,
        customerName: user?.name ?? '',
        customerPhone: phone,
        customerAddress: address,
        entrance,
        floor,
        apartment,
        additionalInfo,
        subtotal, deliveryFee, serviceFee, total,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      });
      setShowPayment(false);
      Alert.alert(
        '🎉 Order Placed!',
        'Payment successful! Your order is on its way.',
        [{
          text: 'OK', onPress: () => {
            clearCart();
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          }
        }]
      );
    } catch (err) {
      Alert.alert('Payment Failed', 'Unable to process payment. Please try again.');
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
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          <FieldStatus value={phone} isValid={isPhoneValid} styles={styles} />
        </View>

        <GooglePlacesAutocomplete
          placeholder="Search delivery address"
          onPress={(data) => setAddress(data.description)}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
            language: 'en',
            types: 'address',
          }}
          styles={{
            container: { marginBottom: 4 },
            textInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.inputBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: focusedField === 'address' ? theme.accent : theme.inputBorder,
              paddingHorizontal: 14,
              ...(focusedField === 'address' && {
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 2,
              }),
            },
            textInput: {
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 0,
              marginVertical: 0,
              marginHorizontal: 0,
              fontSize: 15,
              color: theme.text,
              backgroundColor: 'transparent',
            },
            listView: {
              backgroundColor: theme.card,
              borderRadius: 14,
              marginTop: 4,
              borderWidth: 1,
              borderColor: theme.border,
            },
            row: { backgroundColor: theme.card, padding: 13 },
            description: { fontSize: 14, color: theme.text },
            separator: { backgroundColor: theme.border, height: 1 },
          }}
          renderLeftButton={() => (
            <Text style={styles.inputIcon}>📍</Text>
          )}
          fetchDetails={false}
          enablePoweredByContainer={false}
          textInputProps={{
            placeholderTextColor: theme.textMuted,
            onFocus: () => setFocusedField('address'),
            onBlur: () => setFocusedField(null),
            onChangeText: clearAddressFields,
          }}
          keepResultsAfterBlur={false}
        />

        {isAddressValid && (
          <Text style={[styles.fieldStatusInline, styles.fieldStatusOk, styles.addressSelectedHint]}>
            ✓ Address selected
          </Text>
        )}

        {isAddressValid && (
          <>
            <Text style={styles.detailFieldsLabel}>Complete your delivery address</Text>

            <View style={[styles.inputWrapper, focusedField === 'entrance' && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>🚪</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrance *"
                placeholderTextColor={theme.textMuted}
                value={entrance}
                onChangeText={setEntrance}
                onFocus={() => setFocusedField('entrance')}
                onBlur={() => setFocusedField(null)}
              />
              <FieldStatus value={entrance} isValid={isEntranceValid} styles={styles} />
            </View>

            <View style={[styles.inputWrapper, focusedField === 'floor' && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>🏢</Text>
              <TextInput
                style={styles.input}
                placeholder="Floor *"
                placeholderTextColor={theme.textMuted}
                value={floor}
                onChangeText={setFloor}
                keyboardType="number-pad"
                onFocus={() => setFocusedField('floor')}
                onBlur={() => setFocusedField(null)}
              />
              <FieldStatus value={floor} isValid={isFloorValid} styles={styles} />
            </View>

            <View style={[styles.inputWrapper, focusedField === 'apartment' && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>🏠</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment number *"
                placeholderTextColor={theme.textMuted}
                value={apartment}
                onChangeText={setApartment}
                onFocus={() => setFocusedField('apartment')}
                onBlur={() => setFocusedField(null)}
              />
              <FieldStatus value={apartment} isValid={isApartmentValid} styles={styles} />
            </View>

            <View style={[styles.inputWrapper, focusedField === 'additionalInfo' && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.input}
                placeholder="Additional info (optional)"
                placeholderTextColor={theme.textMuted}
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                onFocus={() => setFocusedField('additionalInfo')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </>
        )}
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
        onPress={openPayment}
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

    <Modal visible={showPayment} animationType="slide" transparent onRequestClose={() => setShowPayment(false)}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Pay with Card</Text>
            <Text style={styles.modalSubtitle}>Secure payment · Powered by Stripe</Text>

            <Text style={styles.cardLabel}>Card Number</Text>
            <View style={[styles.cardInput, payFocused === 'card' && styles.cardInputFocused]}>
              <Text style={styles.cardIcon}>💳</Text>
              <TextInput
                style={styles.cardField}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                maxLength={19}
                returnKeyType="next"
                onSubmitEditing={() => expiryRef.current?.focus()}
                onFocus={() => setPayFocused('card')}
                onBlur={() => setPayFocused(null)}
              />
            </View>

            <View style={styles.cardRow}>
              <View style={styles.cardHalf}>
                <Text style={styles.cardLabel}>Expiry</Text>
                <View style={[styles.cardInput, payFocused === 'expiry' && styles.cardInputFocused]}>
                  <TextInput
                    ref={expiryRef}
                    style={styles.cardField}
                    value={cardExpiry}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="next"
                    onSubmitEditing={() => cvvRef.current?.focus()}
                    onFocus={() => setPayFocused('expiry')}
                    onBlur={() => setPayFocused(null)}
                  />
                </View>
              </View>
              <View style={styles.cardHalf}>
                <Text style={styles.cardLabel}>CVV</Text>
                <View style={[styles.cardInput, payFocused === 'cvv' && styles.cardInputFocused]}>
                  <TextInput
                    ref={cvvRef}
                    style={styles.cardField}
                    value={cardCvv}
                    onChangeText={v => setCardCvv(v.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    onFocus={() => setPayFocused('cvv')}
                    onBlur={() => setPayFocused(null)}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.testHint}>Test: 4242 4242 4242 4242 · 12/26 · 123</Text>

            <TouchableOpacity
              style={[styles.payButton, (!canPay || loading) && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!canPay || loading}
            >
              {loading ? (
                <View style={styles.payButtonInner}>
                  <ActivityIndicator color={theme.accentText} size="small" />
                  <Text style={styles.payButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={[styles.payButtonText, !canPay && styles.payButtonTextDisabled]}>
                  {canPay ? `Pay €${total.toFixed(2)}` : 'Enter card details'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPayment(false)} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>

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
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: t.text },

    fieldStatus: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
    fieldStatusOk: { color: t.good },
    fieldStatusErr: { color: t.bad },
    fieldStatusInline: { fontSize: 12, fontWeight: '600' },

    addressSelectedHint: { marginBottom: 10, paddingHorizontal: 4 },
    detailFieldsLabel: {
      fontSize: 12, fontWeight: '700', color: t.textSub,
      marginBottom: 12, letterSpacing: 0.3,
    },

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

    modalOverlay: {
      flex: 1, justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalSheet: {
      backgroundColor: t.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16,
    },
    modalHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: t.border, alignSelf: 'center', marginBottom: 24,
    },
    modalTitle: { fontSize: 22, fontWeight: '800', color: t.text, marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: t.textMuted, marginBottom: 24 },

    cardLabel: { fontSize: 12, fontWeight: '700', color: t.textSub, marginBottom: 8, letterSpacing: 0.5 },
    cardInput: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.inputBg, borderRadius: 14,
      borderWidth: 1, borderColor: t.inputBorder,
      paddingHorizontal: 14, marginBottom: 16, height: 52,
    },
    cardInputFocused: {
      borderColor: t.accent,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
    },
    cardIcon: { fontSize: 16, marginRight: 10 },
    cardField: { flex: 1, fontSize: 16, color: t.text, letterSpacing: 0.5 },
    cardRow: { flexDirection: 'row', gap: 12 },
    cardHalf: { flex: 1 },

    testHint: {
      fontSize: 11, color: t.textDim, textAlign: 'center',
      marginBottom: 24, marginTop: 4,
    },

    payButton: {
      backgroundColor: t.accent, borderRadius: 16, padding: 18,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
      marginBottom: 12,
    },
    payButtonDisabled: { backgroundColor: t.inputBg, shadowOpacity: 0 },
    payButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    payButtonText: { fontSize: 17, fontWeight: '800', color: t.accentText },
    payButtonTextDisabled: { color: t.textMuted },

    cancelButton: { alignItems: 'center', paddingVertical: 12 },
    cancelText: { fontSize: 15, color: t.textMuted, fontWeight: '600' },
  });
}
