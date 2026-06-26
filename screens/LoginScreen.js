import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess();
    } catch (err) {
      Alert.alert('Error', 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <Text style={styles.appName}>FoodDash</Text>
          <Text style={styles.tagline}>Order food you love</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {/* Email */}
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#6b7db3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6b7db3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Remember me */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(prev => !prev)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator color="#1A2744" size="small" />
                <Text style={styles.buttonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.footerText}>
              Don't have an account?{'  '}
              <Text style={styles.footerHighlight}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  // Hero
  hero: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#F5A623',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 6 },
  tagline: { fontSize: 15, color: '#6b7db3' },

  // Card
  card: {
    backgroundColor: '#1A2744', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#6b7db3', marginBottom: 24 },

  // Inputs
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#243260', borderRadius: 14,
    borderWidth: 1, borderColor: '#2d3e6e',
    paddingHorizontal: 14, marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#fff' },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 18 },

  // Remember me
  rememberRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 20,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 2, borderColor: '#2d3e6e',
    backgroundColor: '#243260',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  checkmark: { fontSize: 12, fontWeight: '800', color: '#1A2744' },
  rememberText: { fontSize: 14, color: '#a0aec0' },

  // Button
  button: {
    backgroundColor: '#F5A623', borderRadius: 14, padding: 17,
    alignItems: 'center', marginTop: 6,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  buttonLoading: { opacity: 0.85 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonText: { color: '#1A2744', fontSize: 17, fontWeight: '800' },

  // Footer
  registerLink: { marginTop: 22, alignItems: 'center' },
  footerText: { color: '#6b7db3', fontSize: 14 },
  footerHighlight: { color: '#F5A623', fontWeight: '700' },
});
