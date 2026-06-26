import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import CartScreen from './screens/CartScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import NotificationsScreen from './screens/NotificationsScreen';

function CartTabScreen({ navigation }) {
  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.header}>
        <Text style={tabStyles.headerTitle}>Your Cart</Text>
        <Text style={tabStyles.headerSubtitle}>Items you've added</Text>
      </View>
      <View style={tabStyles.empty}>
        <Text style={tabStyles.emptyIcon}>🛒</Text>
        <Text style={tabStyles.emptyText}>Your cart is empty</Text>
        <Text style={tabStyles.emptySubtext}>Add items from a restaurant to get started</Text>
        <TouchableOpacity
          style={tabStyles.browseBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={tabStyles.browseBtnText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a33' },
  header: {
    backgroundColor: '#1A2744', paddingHorizontal: 20,
    paddingTop: 54, paddingBottom: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#F5A623', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyText: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7db3', marginBottom: 28, textAlign: 'center', paddingHorizontal: 40 },
  browseBtn: {
    backgroundColor: '#F5A623', paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  browseBtnText: { color: '#1A2744', fontSize: 15, fontWeight: '800' },
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: '#4a5d80',
        tabBarStyle: {
          backgroundColor: '#1A2744',
          borderTopWidth: 1,
          borderTopColor: '#2d3e6e',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }} />
      <Tab.Screen name="CartTab" component={CartTabScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>, tabBarLabel: 'Cart' }} />
      <Tab.Screen name="Orders" component={OrderTrackingScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧾</Text>, tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔔</Text>, tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (e) {
      console.error(e);
    }
    setAuthReady(true);
  };

  const handleAuthSuccess = () => setIsLoggedIn(true);

  // Show splash until both auth check and splash animation are done
  if (!splashDone || !authReady) {
    return (
      <SplashScreen onReady={() => setSplashDone(true)} />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoginSuccess={handleAuthSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Restaurant" component={RestaurantScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}