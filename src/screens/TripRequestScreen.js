import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { COLORS } from '../constants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GOOGLE_API_KEY = 'AIzaSyAhPtsgbrxI6oO6UEojm1yr_FxOBw9Jjog';

const TripRequestScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [tripInfo, setTripInfo] = useState(null);
  const [dynamicPrices, setDynamicPrices] = useState({
    economy: 2000,
    xl: 3000,
    premium: 4000,
  });

  const calculatePrice = useCallback(distanceMeters => {
    const distanceKm = distanceMeters / 1000;
    return {
      economy: Math.round((3500 + distanceKm * 1200) / 100) * 100,
      xl: Math.round((5000 + distanceKm * 1800) / 100) * 100,
      premium: Math.round((8000 + distanceKm * 2500) / 100) * 100,
    };
  }, []);

  const decodePolyline = useCallback(encoded => {
    let points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;
      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de ubicación',
          message: 'UberClone necesita acceder a tu ubicación',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }, []);

  useEffect(() => {
    // Set Medellin as default origin while GPS loads
    setOrigin({
      latitude: 6.2442,
      longitude: -75.5812,
    });

    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;
      Geolocation.getCurrentPosition(
        position => {
          setOrigin({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.log('Location error:', error.code, error.message);
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 },
      );
    };
    getLocation();
  }, []);

  const handleDestinationSelect = useCallback(
    (data, details) => {
      if (!details) return;
      const dest = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setDestination(dest);
      console.log('dest selected:', dest);

      const currentOrigin = {
        latitude: 6.2442,
        longitude: -75.5812,
      };

      fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${currentOrigin.latitude},${currentOrigin.longitude}&destination=${dest.latitude},${dest.longitude}&key=${GOOGLE_API_KEY}`,
      )
        .then(res => res.json())
        .then(data => {
          console.log('status:', data.status);
          if (data.routes.length > 0) {
            const points = decodePolyline(
              data.routes[0].overview_polyline.points,
            );
            setRouteCoords(points);
            const leg = data.routes[0].legs[0];
            setTripInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
            });
            setDynamicPrices(calculatePrice(leg.distance.value));
          }
        })
        .catch(err => console.log('route error:', err));
    },
    [calculatePrice, decodePolyline],
  );

  const vehicles = [
    {
      id: 'economy',
      label: 'Económico',
      emoji: '🚗',
      price: dynamicPrices.economy,
    },
    { id: 'xl', label: 'XL', emoji: '🚙', price: dynamicPrices.xl },
    {
      id: 'premium',
      label: 'Premium',
      emoji: '🚘',
      price: dynamicPrices.premium,
    },
  ];

  const selectedVehicleData = useMemo(
    () => vehicles.find(v => v.id === selectedVehicle),
    [selectedVehicle, dynamicPrices],
  );

  const handleRequestTrip = useCallback(async () => {
    const user = auth().currentUser;

    if (!tripInfo) {
      Alert.alert(
        'Espera',
        'Calculando ruta, intenta de nuevo en un momento...',
      );
      return;
    }
    if (!user) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    try {
      await firestore().collection('trips').add({
        userId: user.uid,
        origin,
        destination,
        distance: tripInfo.distance,
        duration: tripInfo.duration,
        vehicle: selectedVehicle,
        price: selectedVehicleData?.price,
        status: 'requested',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('¡Viaje solicitado!', 'Buscando conductor...', [
        {
          text: 'Ver seguimiento',
          onPress: () =>
            navigation.navigate('Tracking', {
              origin,
              destination,
              vehicle: selectedVehicle,
              price: selectedVehicleData?.price,
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not request trip');
    }
  }, [
    origin,
    destination,
    tripInfo,
    selectedVehicle,
    selectedVehicleData,
    navigation,
  ]);

  return (
    <View style={styles.container}>
      {/* Map va primero */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 6.2442,
          longitude: -75.5812,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          origin
            ? {
                ...origin,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }>
        {origin && (
          <Marker coordinate={origin} title="Tu ubicación" pinColor={COLORS.primary} />
        )}
        {destination && (
          <Marker coordinate={destination} title="Destino" pinColor="red" />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Search encima del mapa */}
      <View style={styles.searchContainer} pointerEvents="box-none">
        <GooglePlacesAutocomplete
          placeholder="¿A dónde vas?"
          onPress={(data, details) => {
            console.log('place selected:', data.description);
            handleDestinationSelect(data, details);
          }}
          fetchDetails={true}
          minLength={2}
          debounce={400}
          enablePoweredByContainer={false}
          keyboardShouldPersistTaps="always"
          query={{
            key: GOOGLE_API_KEY,
            language: 'es',
            components: 'country:co',
            types: 'geocode',
          }}
          styles={{
            textInput: styles.searchInput,
            listView: styles.searchList,
            row: styles.searchRow,
            description: styles.searchDescription,
          }}
          onFail={error => console.log('Places error:', error)}
          onNotFound={() => console.log('No results found')}
        />
      </View>

      {destination && (
        <View style={styles.panel}>
          {tripInfo && (
            <View style={styles.tripInfo}>
              <View style={styles.tripInfoItem}>
                <Text style={styles.tripInfoLabel}>Distancia</Text>
                <Text style={styles.tripInfoValue}>{tripInfo.distance}</Text>
              </View>
              <View style={styles.tripInfoDivider} />
              <View style={styles.tripInfoItem}>
                <Text style={styles.tripInfoLabel}>Tiempo estimado</Text>
                <Text style={styles.tripInfoValue}>{tripInfo.duration}</Text>
              </View>
            </View>
          )}

          <Text style={styles.categoryTitle}>Selecciona tu vehículo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.id && styles.vehicleCardActive,
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}>
                <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                <Text
                  style={[
                    styles.vehicleLabel,
                    selectedVehicle === vehicle.id && styles.vehicleLabelActive,
                  ]}>
                  {vehicle.label}
                </Text>
                <Text
                  style={[
                    styles.vehiclePrice,
                    selectedVehicle === vehicle.id && styles.vehicleLabelActive,
                  ]}>
                  ${vehicle.price.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestTrip}>
            <Text style={styles.requestButtonText}>
              Solicitar {selectedVehicleData?.label} · $
              {selectedVehicleData?.price?.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 10,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    fontSize: 15,
    color: COLORS.dark,
    paddingHorizontal: 16,
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchList: { borderRadius: 12, elevation: 4, marginTop: 4 },
  searchRow: { backgroundColor: COLORS.white, padding: 12 },
  searchDescription: { fontSize: 14, color: COLORS.dark },
  map: { flex: 1 },
  panel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
  },
  tripInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  tripInfoItem: { flex: 1, alignItems: 'center' },
  tripInfoDivider: { width: 1, backgroundColor: COLORS.lightGray },
  tripInfoLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  tripInfoValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  vehicleCard: {
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  vehicleEmoji: { fontSize: 28, marginBottom: 4 },
  vehicleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  vehicleLabelActive: { color: COLORS.white },
  vehiclePrice: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  requestButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
    elevation: 3,
  },
  requestButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default TripRequestScreen;
