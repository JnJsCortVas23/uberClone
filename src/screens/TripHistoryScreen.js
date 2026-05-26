import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../constants';

const vehicleEmoji = { economy: '🚗', xl: '🚙', premium: '🚘' };
const vehicleLabel = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

const TripHistoryScreen = () => {
    const user = auth().currentUser;
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = useCallback(async () => {
        try {
            const snapshot = await firestore()
                .collection('trips')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));
            setTrips(data);
        } catch (error) {
            console.log('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    const formatDate = useCallback((date) => {
        if (!date) return 'Sin fecha';
        return date.toLocaleDateString('es-CO', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }, []);

    const renderTrip = useCallback(({ item }) => (
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
                <Text style={styles.detailText}>📍 {item.distance}  ·  ⏱ {item.duration}</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'requested' ? '#FFF3CD' : '#D4EDDA' }
                ]}>
                    <Text style={styles.statusText}>
                        {item.status === 'requested' ? 'Solicitado' : 'Completado'}
                    </Text>
                </View>
            </View>
        </View>
    ), [formatDate]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis viajes</Text>
            {trips.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyEmoji}>🚗</Text>
                    <Text style={styles.emptyText}>Aún no tienes viajes</Text>
                </View>
            ) : (
                <FlatList
                    data={trips}
                    keyExtractor={item => item.id}
                    renderItem={renderTrip}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: {
        fontSize: 22, fontWeight: 'bold', color: COLORS.dark,
        padding: 20, paddingBottom: 8,
    },
    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 16, marginBottom: 12, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    vehicleEmoji: { fontSize: 32, marginRight: 12 },
    cardInfo: { flex: 1 },
    vehicleLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
    cardDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    cardPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    cardDetails: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderTopWidth: 1,
        borderTopColor: COLORS.lightGray, paddingTop: 10,
    },
    detailText: { fontSize: 13, color: COLORS.gray },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyText: { fontSize: 16, color: COLORS.gray },
});

export default TripHistoryScreen;