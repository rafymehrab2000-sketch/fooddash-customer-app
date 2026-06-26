import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter',  test: v => /[A-Z]/.test(v) },
  { label: 'One number',            test: v => /[0-9]/.test(v) },
];

function PasswordStrength({ password, styles }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const colors = ['#ef4444', '#ff9800', '#F5A623', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return (
    <View style={styles.strengthBox}>
      <View style={styles.strengthBars}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.strengthBar, i < passed && { backgroundColor: colors[passed - 1] }]} />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: colors[passed - 1] || '#6b7db3' }]}>
        {passed > 0 ? labels[passed - 1] : 'Too weak'}
      </Text>
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/auth/register', {
        name, email, password, phone, role: 'customer'
      });
      const loginResponse = await API.post('/auth/login', { email, password });
      const { token, user } = loginResponse.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      Alert.alert('Error', 'Registration failed. Email may already exist.');
    }
    setLoading(false);
  };

  const focus = (field) => setFocusedField(field);
  const blur = () => setFocusedField(null);

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
          <Text style={styles.tagline}>Delicious food, delivered fast</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Join thousands of food lovers</Text>

          {/* Full name */}
          <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputWrapperFocused]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              onFocus={() => focus('name')}
              onBlur={blur}
            />
          </View>

          {/* Email */}
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              onFocus={() => focus('email')}
              onBlur={blur}
            />
          </View>

          {/* Phone */}
          <View style={[styles.inputWrapper, focusedField === 'phone' && styles.inputWrapperFocused]}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={theme.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onFocus={() => focus('phone')}
              onBlur={blur}
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
              onSubmitEditing={handleRegister}
              onFocus={() => focus('password')}
              onBlur={blur}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <PasswordStrength password={password} styles={styles} />

          {password.length > 0 && (
            <View style={styles.rulesBox}>
              {PASSWORD_RULES.map(rule => {
                const ok = rule.test(password);
                return (
                  <View key={rule.label} style={styles.ruleRow}>
                    <Text style={[styles.ruleIcon, ok && styles.ruleIconOk]}>{ok ? '✓' : '○'}</Text>
                    <Text style={[styles.ruleText, ok && styles.ruleTextOk]}>{rule.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator color={theme.accentText} size="small" />
                <Text style={styles.buttonText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{'  '}
              <Text style={styles.footerHighlight}>Sign In</Text>
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

    strengthBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: -4 },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.border },
    strengthLabel: { fontSize: 12, fontWeight: '700', minWidth: 50, textAlign: 'right' },

    rulesBox: { marginBottom: 18, gap: 6 },
    ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ruleIcon: { fontSize: 13, color: t.textDim, width: 16, textAlign: 'center' },
    ruleIconOk: { color: t.good },
    ruleText: { fontSize: 13, color: t.textDim },
    ruleTextOk: { color: t.textSub },

    button: {
      backgroundColor: t.accent, borderRadius: 14, padding: 17,
      alignItems: 'center', marginTop: 6,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
    },
    buttonLoading: { opacity: 0.85 },
    buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    buttonText: { color: t.accentText, fontSize: 17, fontWeight: '800' },

    loginLink: { marginTop: 22, alignItems: 'center' },
    footerText: { color: t.textMuted, fontSize: 14 },
    footerHighlight: { color: t.accent, fontWeight: '700' },
  });
}
