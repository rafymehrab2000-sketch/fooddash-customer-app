import React, { useEffect, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import API from './services/api';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationsProvider, useNotifications } from './context/NotificationsContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import CartScreen from './screens/CartScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SearchScreen from './screens/SearchScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function CartTabScreen({ navigation }) {
  const { theme } = useTheme();
  const { items, restaurant, cartCount, cartTotal } = useCart();
  const styles = useMemo(() => createCartStyles(theme), [theme]);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>Items you've added</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items from a restaurant to get started</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>🍽️ {restaurant?.name}</Text>
      </View>

      <View style={styles.itemsSection}>
        {items.map((item, index) => (
          <View key={item.id} style={[styles.cartItem, index === items.length - 1 && styles.cartItemLast]}>
            <View style={styles.cartItemQtyBadge}>
              <Text style={styles.cartItemQtyText}>{item.quantity}</Text>
            </View>
            <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cartItemPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>€{cartTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutBtn}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        <View style={styles.checkoutBadge}>
          <Text style={styles.checkoutBadgeText}>{cartCount} item{cartCount !== 1 ? 's' : ''}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function createCartStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    header: {
      backgroundColor: t.card, paddingHorizontal: 20,
      paddingTop: 54, paddingBottom: 24,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: t.accent, marginBottom: 4 },
    headerSubtitle: { fontSize: 15, color: t.textFaint2 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
    emptyIcon: { fontSize: 72, marginBottom: 20 },
    emptyText: { fontSize: 22, fontWeight: '700', color: t.text, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: t.textMuted, marginBottom: 28, textAlign: 'center', paddingHorizontal: 40 },
    browseBtn: {
      backgroundColor: t.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20,
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
    },
    browseBtnText: { color: t.accentText, fontSize: 15, fontWeight: '800' },

    itemsSection: {
      backgroundColor: t.card, marginHorizontal: 16, marginTop: 16,
      borderRadius: 20, padding: 20,
    },
    cartItem: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.border,
    },
    cartItemLast: { borderBottomWidth: 0 },
    cartItemQtyBadge: {
      backgroundColor: t.accent, width: 26, height: 26,
      borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    },
    cartItemQtyText: { fontSize: 12, fontWeight: '800', color: t.accentText },
    cartItemName: { flex: 1, fontSize: 14, color: t.text, fontWeight: '500' },
    cartItemPrice: { fontSize: 14, fontWeight: '700', color: t.accent },
    totalRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      paddingTop: 16, marginTop: 4,
    },
    totalLabel: { fontSize: 15, fontWeight: '700', color: t.text },
    totalValue: { fontSize: 15, fontWeight: '800', color: t.accent },

    checkoutBtn: {
      backgroundColor: t.accent, marginHorizontal: 16, marginTop: 20,
      borderRadius: 18, padding: 18,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      shadowColor: t.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    checkoutBtnText: { fontSize: 17, fontWeight: '800', color: t.accentText },
    checkoutBadge: {
      backgroundColor: t.accentText, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 5,
    },
    checkoutBadgeText: { fontSize: 13, fontWeight: '800', color: t.accent },
  });
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.tabBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="CartTab" component={CartTabScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />, tabBarLabel: 'Cart', tabBarBadge: cartCount > 0 ? cartCount : undefined }} />
      <Tab.Screen name="Orders" component={OrderTrackingScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />, tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />, tabBarLabel: 'Alerts', tabBarBadge: unreadCount > 0 ? unreadCount : undefined }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => { checkLogin(); }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    let subscription;

    const setupPushNotifications = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

      try {
        await API.post('/users/push-token', { token: pushToken });
      } catch (e) {
        console.error('Failed to save push token:', e);
      }

      // Store foreground notifications in the list (system banner handles display)
      subscription = Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;
        addNotification(notification.request.identifier, title, body);
      });

      // Handle app launch from a notification (killed state)
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        const { title, body } = lastResponse.notification.request.content;
        addNotification(lastResponse.notification.request.identifier, title, body);
      }
    };

    // Store tapped notifications (backgrounded state); deduped by identifier
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body } = response.notification.request.content;
      addNotification(response.notification.request.identifier, title, body);
    });

    setupPushNotifications().catch((e) =>
      console.error('Push notification setup failed:', e)
    );

    return () => {
      subscription?.remove();
      tapSub.remove();
    };
  }, [isLoggedIn, addNotification]);

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

  if (!splashDone || !authReady) {
    return <SplashScreen onReady={() => setSplashDone(true)} />;
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
            <Stack.Screen name="Search" component={SearchScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
