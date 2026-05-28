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

const PAYMENT_METHODS = {
  MERCADOPAGO: 'mercadopago',
  CASH: 'cash',
};

const PaymentScreen = ({ route, navigation }) => {
  const { tripId, price, vehicle } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);

  const vehicleLabel =
    vehicle === 'economy' ? 'Económico' : vehicle === 'xl' ? 'XL' : 'Premium';
  const vehicleEmoji =
    vehicle === 'economy' ? '🚗' : vehicle === 'xl' ? '🚙' : '🚘';

  const markTripPaid = useCallback(
    async paymentMethod => {
      if (!tripId) return;
      await firestore().collection('trips').doc(tripId).update({
        status: 'paid',
        paymentMethod,
        paidAt: firestore.FieldValue.serverTimestamp(),
      });
    },
    [tripId],
  );

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
                title: 'Viaje UberClone',
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
      if (data.init_point) {
        setPaymentUrl(data.init_point);
      } else {
        Alert.alert('Error', 'No se pudo crear el pago');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con Mercado Pago');
    }
    setLoading(false);
  }, [price]);

  const handleCashPayment = useCallback(() => {
    Alert.alert(
      'Pago en efectivo',
      `¿Confirmas que pagarás $${price?.toLocaleString()} COP en efectivo al conductor?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await markTripPaid(PAYMENT_METHODS.CASH);
              Alert.alert('Listo', 'Pago en efectivo registrado', [
                { text: 'OK', onPress: () => navigation.navigate('Tabs') },
              ]);
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'No se pudo registrar el pago',
              );
            }
            setLoading(false);
          },
        },
      ],
    );
  }, [price, markTripPaid, navigation]);

  const handlePayPress = useCallback(() => {
    if (!selectedMethod) {
      Alert.alert('Método de pago', 'Selecciona cómo quieres pagar');
      return;
    }
    if (selectedMethod === PAYMENT_METHODS.CASH) {
      handleCashPayment();
      return;
    }
    createPreference();
  }, [selectedMethod, handleCashPayment, createPreference]);

  const handleNavigationChange = useCallback(
    async navState => {
      const { url } = navState;

      if (url.includes('payment/success') || url.includes('status=approved')) {
        try {
          await markTripPaid(PAYMENT_METHODS.MERCADOPAGO);
          Alert.alert('¡Pago exitoso!', 'Tu viaje ha sido pagado', [
            { text: 'OK', onPress: () => navigation.navigate('Tabs') },
          ]);
        } catch (error) {
          Alert.alert('Error', error.message || 'No se pudo guardar el pago');
        }
      }

      if (url.includes('payment/failure') || url.includes('status=rejected')) {
        Alert.alert('Pago rechazado', 'Intenta con otro método de pago', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    },
    [markTripPaid, navigation],
  );

  if (paymentUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPaymentUrl(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mercado Pago</Text>
        </View>
        {webViewLoading && (
          <View style={styles.webViewLoader}>
            <ActivityIndicator size="large" color="#009EE3" />
            <Text style={styles.webViewLoaderText}>Cargando Mercado Pago...</Text>
          </View>
        )}
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationChange}
          onLoadEnd={() => setWebViewLoading(false)}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar viaje</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryEmoji}>{vehicleEmoji}</Text>
        <Text style={styles.summaryVehicle}>{vehicleLabel}</Text>
        <Text style={styles.summaryPrice}>${price?.toLocaleString()} COP</Text>
        <Text style={styles.summaryLabel}>Total a pagar</Text>
      </View>

      <Text style={styles.sectionTitle}>Método de pago</Text>

      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === PAYMENT_METHODS.MERCADOPAGO &&
            styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod(PAYMENT_METHODS.MERCADOPAGO)}
        activeOpacity={0.8}>
        <Text style={styles.methodEmoji}>💳</Text>
        <View style={styles.methodTextWrap}>
          <Text style={styles.methodTitle}>Mercado Pago</Text>
          <Text style={styles.methodSubtitle}>Tarjeta, PSE o billetera</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === PAYMENT_METHODS.CASH && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod(PAYMENT_METHODS.CASH)}
        activeOpacity={0.8}>
        <Text style={styles.methodEmoji}>💵</Text>
        <View style={styles.methodTextWrap}>
          <Text style={styles.methodTitle}>Efectivo</Text>
          <Text style={styles.methodSubtitle}>
            Pagas al conductor al finalizar
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayPress}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.payButtonText}>
            {selectedMethod === PAYMENT_METHODS.CASH
              ? 'Confirmar pago en efectivo'
              : `Pagar $${price?.toLocaleString()}`}
          </Text>
        )}
      </TouchableOpacity>
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
    marginBottom: 12,
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
  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F0FE',
  },
  methodEmoji: { fontSize: 28, marginRight: 14 },
  methodTextWrap: { flex: 1 },
  methodTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  methodSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  payButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
    marginTop: 8,
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
