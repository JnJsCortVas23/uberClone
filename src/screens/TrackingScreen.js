import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { COLORS } from '../constants';

// Simulates driver moving toward user — generates intermediate coordinates
const interpolateCoords = (start, end, steps) => {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    coords.push({
      latitude: start.latitude + (end.latitude - start.latitude) * (i / steps),
      longitude:
        start.longitude + (end.longitude - start.longitude) * (i / steps),
    });
  }
  return coords;
};

const TrackingScreen = ({ route, navigation }) => {
  // Receives origin and destination from TripRequestScreen
  const { origin, destination, vehicle, price } = route.params || {};

  if (!origin) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 16, color: 'gray' }}>
          No hay un viaje activo
        </Text>
      </View>
    );
  }

  // Driver starts 0.01 degrees away from user
  const driverStart = useMemo(
    () => ({
      latitude: origin.latitude + 0.01,
      longitude: origin.longitude + 0.01,
    }),
    [origin],
  );

  const [driverPosition, setDriverPosition] = useState(driverStart);
  const [status, setStatus] = useState('searching'); // searching | arriving | arrived
  const [stepIndex, setStepIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate all intermediate steps from driver start to user
  const routeSteps = useMemo(
    () => interpolateCoords(driverStart, origin, 20),
    [driverStart, origin],
  );

  // Pulse animation for driver marker
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startPulse();
    setStatus('searching');

    // Move driver one step every 800ms
    const interval = setInterval(() => {
      setStepIndex(prev => {
        const next = prev + 1;
        if (next >= routeSteps.length) {
          clearInterval(interval);
          setStatus('arrived');
          return prev;
        }
        setDriverPosition(routeSteps[next]);
        if (next > routeSteps.length * 0.3) {
          setStatus('arriving');
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [routeSteps, startPulse]);

  // Line from driver current position to user
  const driverRoute = useMemo(
    () => [driverPosition, origin],
    [driverPosition, origin],
  );

  const statusConfig = useMemo(
    () => ({
      searching: {
        emoji: '🔍',
        text: 'Buscando conductor...',
        color: COLORS.gray,
      },
      arriving: {
        emoji: '🚗',
        text: 'Tu conductor está en camino',
        color: COLORS.primary,
      },
      arrived: {
        emoji: '✅',
        text: '¡Tu conductor ha llegado!',
        color: '#27AE60',
      },
    }),
    [],
  );

  const current = statusConfig[status];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (origin.latitude + driverStart.latitude) / 2,
          longitude: (origin.longitude + driverStart.longitude) / 2,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        {/* User marker */}
        <Marker coordinate={origin} title="Tu ubicación">
          <View style={styles.userMarker}>
            <Text style={styles.userMarkerText}>📍</Text>
          </View>
        </Marker>

        {/* Destination marker */}
        {destination && (
          <Marker coordinate={destination} title="Destino">
            <Text style={{ fontSize: 28 }}>🏁</Text>
          </Marker>
        )}

        {/* Animated driver marker */}
        <Marker coordinate={driverPosition} title="Tu conductor">
          <Animated.View
            style={[styles.driverMarker, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={styles.driverEmoji}>🚗</Text>
          </Animated.View>
        </Marker>

        {/* Line from driver to user */}
        <Polyline
          coordinates={driverRoute}
          strokeColor={COLORS.primary}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
        />
      </MapView>

      {/* Status Panel */}
      <View style={styles.panel}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: current.color + '20' },
          ]}
        >
          <Text style={styles.statusEmoji}>{current.emoji}</Text>
          <Text style={[styles.statusText, { color: current.color }]}>
            {current.text}
          </Text>
        </View>

        {/* Trip details */}
        <View style={styles.tripDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vehículo</Text>
            <Text style={styles.detailValue}>
              {vehicle === 'economy'
                ? ' Económico'
                : vehicle === 'xl'
                ? ' XL'
                : '🚘 Premium'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tarifa</Text>
            <Text style={styles.detailValue}>${price?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(stepIndex / routeSteps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {status === 'arrived'
            ? 'El conductor llegó a tu ubicación'
            : `Conductor aproximándose... ${Math.round(
                (stepIndex / routeSteps.length) * 100,
              )}%`}
        </Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            status === 'arrived' && { backgroundColor: '#27AE60' },
          ]}
          onPress={() => {
            if (status === 'arrived') {
              navigation.navigate('Payment', {
                price,
                vehicle,
              });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {status === 'arrived' ? '¡Pagar viaje!' : 'Cancelar viaje'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerText: { fontSize: 32 },
  driverMarker: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  driverEmoji: { fontSize: 24 },
  panel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusEmoji: { fontSize: 20, marginRight: 10 },
  statusText: { fontSize: 15, fontWeight: '700' },
  tripDetails: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailDivider: { width: 1, backgroundColor: COLORS.lightGray },
  detailLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.dark },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrackingScreen;
