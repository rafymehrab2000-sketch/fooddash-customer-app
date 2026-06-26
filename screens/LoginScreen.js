import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
              placeholderTextColor={theme.textMuted}
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
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Remember me */}
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(prev => !prev)}>
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
                <ActivityIndicator color={theme.accentText} size="small" />
                <Text style={styles.buttonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
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

function createStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },

    hero: { alignItems: 'center', marginBottom: 32 },
    logoBox: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: t.accent,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
    logoEmoji: { fontSize: 40 },
    appName: { fontSize: 32, fontWeight: '800', color: t.text, marginBottom: 6 },
    tagline: { fontSize: 15, color: t.textMuted },

    card: {
      backgroundColor: t.card, borderRadius: 24, padding: 24,
      shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: t.text, marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: t.textMuted, marginBottom: 24 },

    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.inputBg, borderRadius: 14,
      borderWidth: 1, borderColor: t.inputBorder,
      paddingHorizontal: 14, marginBottom: 14,
    },
    inputWrapperFocused: {
      borderColor: t.accent,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: t.text },
    eyeButton: { padding: 4 },
    eyeIcon: { fontSize: 18 },

    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    checkbox: {
      width: 20, height: 20, borderRadius: 6,
      borderWidth: 2, borderColor: t.inputBorder,
      backgroundColor: t.inputBg,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: t.accent, borderColor: t.accent },
    checkmark: { fontSize: 12, fontWeight: '800', color: t.accentText },
    rememberText: { fontSize: 14, color: t.textSub },

    button: {
      backgroundColor: t.accent, borderRadius: 14, padding: 17,
      alignItems: 'center', marginTop: 6,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
    },
    buttonLoading: { opacity: 0.85 },
    buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    buttonText: { color: t.accentText, fontSize: 17, fontWeight: '800' },

    registerLink: { marginTop: 22, alignItems: 'center' },
    footerText: { color: t.textMuted, fontSize: 14 },
    footerHighlight: { color: t.accent, fontWeight: '700' },
  });
}
