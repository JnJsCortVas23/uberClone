import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../constants';

const vehicleEmoji = { economy: '🚗', xl: '🚙', premium: '🚘' };
const vehicleLabel = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

const paymentLabel = {
  mercadopago: '💳 Mercado Pago',
  cash: '💵 Efectivo',
};

const statusLabel = {
  pending: 'Pendiente',
  requested: 'Solicitado',
  active: 'En curso',
  in_trip: 'En viaje',
  finished: 'Finalizado',
  paid: 'Pagado',
  completed: 'Completado',
};

const statusBadgeColor = {
  pending: '#FFF3CD',
  requested: '#FFF3CD',
  active: '#CCE5FF',
  in_trip: '#CCE5FF',
  finished: '#D1ECF1',
  paid: '#D4EDDA',
  completed: '#D4EDDA',
};

const TripHistoryScreen = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setTrips([]);
      setError('Debes iniciar sesión para ver tu historial.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sin orderBy en Firestore: evita índice compuesto y ordenamos en la app
      const snapshot = await firestore()
        .collection('trips')
        .where('userId', '==', currentUser.uid)
        .get();

      const data = snapshot.docs
        .map(doc => {
          const raw = doc.data();
          return {
            id: doc.id,
            ...raw,
            createdAt: raw.createdAt?.toDate?.() ?? null,
          };
        })
        .sort((a, b) => {
          const aTime = a.createdAt?.getTime() ?? 0;
          const bTime = b.createdAt?.getTime() ?? 0;
          return bTime - aTime;
        });

      setTrips(data);
    } catch (err) {
      console.log('Error fetching trips:', err);
      setTrips([]);
      setError(
        err?.message ||
          'No se pudieron cargar los viajes. Revisa tu conexión y las reglas de Firestore.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips]),
  );

  const formatDate = useCallback(date => {
    if (!date) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderTrip = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.vehicleEmoji}>
            {vehicleEmoji[item.vehicle] || '🚗'}
          </Text>
          <View style={styles.cardInfo}>
            <Text style={styles.vehicleLabel}>
              {vehicleLabel[item.vehicle] || item.vehicle}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.cardPrice}>
            ${item.price?.toLocaleString()}
          </Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.detailText} numberOfLines={2}>
            📍 {item.distance || '—'} · ⏱ {item.duration || '—'}
            {item.paymentMethod
              ? ` · ${paymentLabel[item.paymentMethod] || item.paymentMethod}`
              : ''}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusBadgeColor[item.status] || '#E9ECEF',
              },
            ]}>
            <Text style={styles.statusText}>
              {statusLabel[item.status] || item.status || '—'}
            </Text>
          </View>
        </View>
      </View>
    ),
    [formatDate],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        renderItem={renderTrip}
        style={styles.list}
        contentContainerStyle={
          trips.length === 0 ? styles.listEmptyContent : styles.listContent
        }
        ListHeaderComponent={
          <Text style={styles.title}>Mis viajes</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyText}>Aún no tienes viajes</Text>
            <Text style={styles.emptyHint}>
              Solicita un viaje en la pestaña Viaje para verlo aquí.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 24 },
  listEmptyContent: { flexGrow: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  vehicleEmoji: { fontSize: 32, marginRight: 12 },
  cardInfo: { flex: 1 },
  vehicleLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  cardDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  cardPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    gap: 8,
  },
  detailText: { flex: 1, fontSize: 13, color: COLORS.gray },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  emptyHint: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: {
    fontSize: 15,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: { color: COLORS.white, fontWeight: 'bold' },
});

export default TripHistoryScreen;
