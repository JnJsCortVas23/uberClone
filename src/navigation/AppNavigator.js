import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import TrackingScreen from '../screens/TrackingScreen';
import PaymentScreen from '../screens/PaymentScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TripRequestScreen from '../screens/TripRequestScreen';

import { COLORS } from '../constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingBottom: 6,
        paddingTop: 6,
        height: 60,
      },
      tabBarLabel: ({ color }) => {
        const labels = {
          Home: 'Inicio',
          Trip: 'Viaje',
          Profile: 'Perfil',
          History: 'Historial',
        };
        return (
          <Text style={{ color, fontSize: 12, fontWeight: '600' }}>
            {labels[route.name]}
          </Text>
        );
      },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: '🏠',
          Trip: '🗺️',
          Profile: '👤',
          History: '🕐',
        };
        return (
          <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>
        );
      },
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Trip" component={TripRequestScreen} />
    <Tab.Screen name="History" component={TripHistoryScreen} />
  </Tab.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={AppTabs} />
    <Stack.Screen name="Tracking" component={TrackingScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.gray }}>Cargando...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;