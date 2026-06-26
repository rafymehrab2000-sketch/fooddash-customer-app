import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🍔 FoodDash</Text>
        <Text style={styles.subtitle}>Sign in to order food</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7db3"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6b7db3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>Don't have an account? <Text style={styles.orangeText}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2744', justifyContent: 'center' },
  content: { paddingHorizontal: 30 },
  logo: { fontSize: 40, fontWeight: '800', color: '#F5A623', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#a0aec0', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#243260', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#2d3e6e', color: '#fff' },
  button: { backgroundColor: '#F5A623', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#1A2744', fontSize: 18, fontWeight: '700' },
  registerLink: { marginTop: 25 },
  footerText: { textAlign: 'center', color: '#a0aec0', fontSize: 15 },
  orangeText: { color: '#F5A623', fontWeight: 'bold' },
});