import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../constants';

const ACCESS_TOKEN = 'YOUR_GOOGLE_API_KEY_HERE';

const PaymentScreen = ({ route, navigation }) => {
  const { tripId, price, vehicle } = route.params || {};
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);

  const createPreference = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            items: [
              {
                title: `Viaje UberClone`,
                quantity: 1,
                currency_id: 'COP',
                unit_price: price,
              },
            ],
            back_urls: {
              success: 'uberclone://payment/success',
              failure: 'uberclone://payment/failure',
              pending: 'uberclone://payment/pending',
            },
          }),
        },
      );
      const data = await response.json();
      console.log('MercadoPago response:', JSON.stringify(data)); // 👈 agrega esto
      if (data.init_point) {
        setPaymentUrl(data.init_point);
      } else {
        Alert.alert('Error', 'Could not create payment');
      }
    } catch (error) {
      console.log('Payment error:', error); // 👈 agrega esto
      Alert.alert('Error', 'Could not connect to MercadoPago');
    }
    setLoading(false);
  }, [price, vehicle]);

  const handleNavigationChange = useCallback(
    async navState => {
      const { url } = navState;

      // Payment successful
      if (url.includes('payment/success') || url.includes('status=approved')) {
        try {
          if (tripId) {
            await firestore().collection('trips').doc(tripId).update({
              status: 'paid',
              paidAt: firestore.FieldValue.serverTimestamp(),
            });
          }
          Alert.alert('¡Pago exitoso!', 'Tu viaje ha sido pagado', [
            { text: 'OK', onPress: () => navigation.navigate('Tabs') },
          ]);
        } catch (error) {
          console.log('Payment error message:', error.message);
          console.log('Payment error full:', JSON.stringify(error));
          Alert.alert('Error detalle', error.message || 'Sin mensaje de error');
        }
      }

      // Payment failed
      if (url.includes('payment/failure') || url.includes('status=rejected')) {
        Alert.alert('Pago rechazado', 'Intenta con otro método de pago', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    },
    [tripId, navigation],
  );

  // Show payment button first
  if (!paymentUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagar viaje</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryEmoji}>
            {vehicle === 'economy' ? '🚗' : vehicle === 'xl' ? '🚙' : '🚘'}
          </Text>
          <Text style={styles.summaryVehicle}>
            {vehicle === 'economy'
              ? 'Económico'
              : vehicle === 'xl'
              ? 'XL'
              : 'Premium'}
          </Text>
          <Text style={styles.summaryPrice}>
            ${price?.toLocaleString()} COP
          </Text>
          <Text style={styles.summaryLabel}>Total a pagar</Text>
        </View>

        <View style={styles.mpContainer}>
          <Text style={styles.mpTitle}>Pagar con</Text>
          <Text style={styles.mpLogo}>💳 MercadoPago</Text>
          <Text style={styles.mpSubtitle}>
            Tarjeta de crédito, débito o efectivo
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={createPreference}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payButtonText}>
              Pagar ${price?.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Show WebView with MercadoPago checkout
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setPaymentUrl(null);
          }}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MercadoPago</Text>
      </View>
      {webViewLoading && (
        <View style={styles.webViewLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.webViewLoaderText}>Cargando MercadoPago...</Text>
        </View>
      )}
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        onLoadEnd={() => setWebViewLoading(false)}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  summary: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  summaryEmoji: { fontSize: 50, marginBottom: 8 },
  summaryVehicle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  summaryPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
  },
  summaryLabel: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  mpContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  mpTitle: { fontSize: 14, color: COLORS.gray, marginBottom: 8 },
  mpLogo: { fontSize: 22, fontWeight: 'bold', color: '#009EE3' },
  mpSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 6 },
  payButton: {
    backgroundColor: '#009EE3',
    margin: 20,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
  webView: { flex: 1 },
  webViewLoader: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  webViewLoaderText: { marginTop: 12, color: COLORS.gray },
});

export default PaymentScreen;
