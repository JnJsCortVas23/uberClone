import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {COLORS} from '../constants';

const HomeScreen = () => {
  const user = auth().currentUser;
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const doc = await firestore().collection('users').doc(user.uid).get();
      if (doc.exists) {
        setFullName(doc.data().fullName);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await auth().signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido {fullName}!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;