import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../constants';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>UberClone</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default LoginScreen;