import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {COLORS} from '../constants';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade + scale than logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Animated load point
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.timing(dot2, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.timing(dot3, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.parallel([
          Animated.timing(dot1, {toValue: 0.3, duration: 300, useNativeDriver: true}),
          Animated.timing(dot2, {toValue: 0.3, duration: 300, useNativeDriver: true}),
          Animated.timing(dot3, {toValue: 0.3, duration: 300, useNativeDriver: true}),
        ]),
      ]).start(() => animateDots());
    };
    animateDots();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>U</Text>
        </View>
        <Text style={styles.appName}>UberClone</Text>
        <Text style={styles.slogan}>Tus viajes más parchados</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, {opacity: dot1}]} />
        <Animated.View style={[styles.dot, {opacity: dot2}]} />
        <Animated.View style={[styles.dot, {opacity: dot3}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 15,
    color: COLORS.white,
    opacity: 0.85,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
});

export default SplashScreen;