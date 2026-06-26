import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';

export default function SplashScreen({ onReady }) {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotScale    = useRef([
    new Animated.Value(0.6),
    new Animated.Value(0.6),
    new Animated.Value(0.6),
  ]).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo pops in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Text fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 3. Loading dots pulse
        pulseDots(() => {
          // 4. Whole screen fades out, then calls onReady
          Animated.timing(exitOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(() => onReady());
        });
      });
    });
  }, []);

  const pulseDots = (onDone) => {
    const pulse = (dot) =>
      Animated.sequence([
        Animated.spring(dot, { toValue: 1.4, speed: 30, useNativeDriver: true }),
        Animated.spring(dot, { toValue: 0.6, speed: 30, useNativeDriver: true }),
      ]);

    Animated.sequence([
      Animated.stagger(120, dotScale.map(d => pulse(d))),
      Animated.stagger(120, dotScale.map(d => pulse(d))),
    ]).start(onDone);
  };

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      {/* Glow ring */}
      <View style={styles.glowRing}>
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <Text style={styles.logoEmoji}>🍔</Text>
        </Animated.View>
      </View>

      {/* App name + tagline */}
      <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
        <Text style={styles.appName}>FoodDash</Text>
        <Text style={styles.tagline}>Delicious food, delivered fast</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: textOpacity }]}>
        {dotScale.map((s, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ scale: s }] }]} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f1a33',
    alignItems: 'center', justifyContent: 'center',
  },
  glowRing: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 2, borderColor: 'rgba(245,166,35,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 30, elevation: 12,
  },
  logoBox: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: '#F5A623',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 52 },
  textBlock: { alignItems: 'center', marginBottom: 48 },
  appName: {
    fontSize: 38, fontWeight: '800', color: '#fff',
    letterSpacing: 1, marginBottom: 8,
  },
  tagline: { fontSize: 15, color: '#6b7db3' },
  dotsRow: { flexDirection: 'row', gap: 10 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#F5A623',
  },
});
