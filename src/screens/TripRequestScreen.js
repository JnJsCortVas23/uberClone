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
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { COLORS } from '../constants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MapViewDirections from 'react-native-maps-directions';

<<<<<<< HEAD
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
=======
const GOOGLE_API_KEY = 'AIzaSyCEwXYv8x_fvvk8anRJE4E-38JXQaXlu6U';
>>>>>>> ff49ced (Fix: search location and payment gateway)

const TripRequestScreen = ({ navigation }) => {
  const mapRef = useRef(null);


  const [origin, setOrigin] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
  });
  const [destination, setDestination] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [tripInfo, setTripInfo] = useState(null);
  const [dynamicPrices, setDynamicPrices] = useState({
    economy: 3500,
    xl: 5000,
    premium: 8000,
  });


  const [driverLocation, setDriverLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle');

  const calculatePrice = useCallback(distanceMeters => {
    const distanceKm = distanceMeters / 1000;
    return {
      economy: Math.round((1 + distanceKm * 1600) / 100) * 100,
      xl: Math.round((5000 + distanceKm * 2100) / 100) * 100,
      premium: Math.round((8000 + distanceKm * 2800) / 100) * 100,
    };
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
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
      } catch (err) {
        return false;
      }
    }
    return true;
  }, []);


  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        position => {
          if (position.coords.latitude > 35 && position.coords.latitude < 38) {
            console.log(
              '📌 GPS del emulador en USA detectado. Manteniendo Medellín por defecto.',
            );
            return;
          }
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
  }, [requestLocationPermission]);

  const handleDestinationSelect = (data, details) => {
    if (!details) return;

    const dest = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
    setDestination(dest);
    console.log('📍 Destino seleccionado:', dest);

    fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&key=${GOOGLE_API_KEY}`,
    )
      .then(res => res.json())
      .then(data => {
        if (data.status === 'OK' && data.routes.length > 0) {
          const leg = data.routes[0].legs[0];
          setTripInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
          });
          setDynamicPrices(calculatePrice(leg.distance.value));
        } else {
          Alert.alert(
            'Error de Ruta',
            'Google no pudo calcular una ruta terrestre. Asegúrate de buscar un destino dentro de la misma región (Medellín).',
          );
        }
      })
      .catch(err => console.log('route error:', err));
  };

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

    if (!tripInfo || !destination) {
      Alert.alert(
        'Espera',
        'Por favor selecciona un destino válido antes de solicitar.',
      );
      return;
    }
    if (!user) {
      Alert.alert('Error', 'No hay una sesión activa en la aplicación.');
      return;
    }


    const tempTripId = `temp_trip_${Date.now()}`;
    let realTripId = null;

    try {

      setTripStatus('requested');
      Alert.alert('Viaje Solicitado', 'Buscando conductor cerca...');


      setTimeout(() => {
        setTripStatus('driver_coming');
        setDriverLocation({
          latitude: origin.latitude + 0.003,
          longitude: origin.longitude + 0.003,
        });


        if (realTripId) {
          firestore()
            .collection('trips')
            .doc(realTripId)
            .update({ status: 'active' })
            .catch(e => console.log(e));
        }


        setTimeout(() => {
          setTripStatus('in_trip');
          setDriverLocation(null);

          if (realTripId) {
            firestore()
              .collection('trips')
              .doc(realTripId)
              .update({ status: 'in_trip' })
              .catch(e => console.log(e));
          }


          setTimeout(() => {
            setTripStatus('finished');

            if (realTripId) {
              firestore()
                .collection('trips')
                .doc(realTripId)
                .update({ status: 'finished' })
                .catch(e => console.log(e));
            }

            Alert.alert(
              'Viaje Finalizado',
              'Llegaste a tu destino. Procediendo al pago.',
              [
                {
                  text: 'Ir a Pagar',
                  onPress: () => {
                    navigation.navigate('Payment', {
                      tripId: realTripId || tempTripId,
                      price: selectedVehicleData?.price,
                      vehicle: selectedVehicle,
                    });
                  },
                },
              ],
            );
          }, 6000);
        }, 6000);
      }, 3000);


      firestore()
        .collection('trips')
        .add({
          userId: user.uid,
          origin: origin,
          destination: destination,
          distance: tripInfo.distance,
          duration: tripInfo.duration,
          vehicle: selectedVehicle,
          price: selectedVehicleData?.price,
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
        })
        .then(docRef => {
          realTripId = docRef.id;
          console.log(
            '🔥 [Firebase] Viaje creado exitosamente en la DB con ID:',
            realTripId,
          );
        })
        .catch(firebaseError => {
          console.log(
            '⚠️ [Firebase Error] No se pudo escribir en Firestore. Revisa las Rules o conexión:',
          );
          console.error(firebaseError);
        });
    } catch (error) {
      setTripStatus('idle');
      Alert.alert('Error', 'Ocurrió un error en el flujo de la aplicación.');
      console.error(error);
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
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={false}
        followsUserLocation={false}
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
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }
            : undefined
        }
      >
        {origin && (
          <Marker
            coordinate={origin}
            title="Punto de recogida"
            pinColor={COLORS.primary}
          />
        )}

        {destination && (
          <Marker coordinate={destination} title="Destino" pinColor="red" />
        )}

        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Tu Conductor"
            pinColor="black"
            description="En camino"
          />
        )}

        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            onReady={result => {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 70, right: 50, bottom: 380, left: 50 },
                animated: true,
              });
            }}
          />
        )}

        {driverLocation && tripStatus === 'driver_coming' && (
          <MapViewDirections
            origin={driverLocation}
            destination={origin}
            apikey={GOOGLE_API_KEY}
            strokeWidth={3}
            strokeColor="#333333"
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <View style={styles.searchContainer} pointerEvents="box-none">
        <GooglePlacesAutocomplete
          placeholder="¿A dónde vas?"
          onPress={handleDestinationSelect}
          fetchDetails={true}
          minLength={2}
          debounce={300}
          nearbyPlacesAPI="GooglePlacesSearch"
          query={{
            key: GOOGLE_API_KEY,
            language: 'es',
            components: 'country:co',
          }}
          requestUrl={{
            useOnPlatform: 'android',
            url: 'https://maps.googleapis.com/maps/api',
          }}
          styles={{
            textInput: styles.searchInput,
            listView: styles.searchList,
            row: styles.searchRow,
            description: styles.searchDescription,
          }}
          enablePoweredByContainer={false}
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

          <Text style={styles.categoryTitle}>
            {tripStatus === 'idle' && 'Selecciona tu vehículo'}
            {tripStatus === 'requested' && 'Buscando tu auto...'}
            {tripStatus === 'driver_coming' && '¡Conductor asignado en camino!'}
            {tripStatus === 'in_trip' && 'Viajando hacia el destino...'}
            {tripStatus === 'finished' && '¡Viaje terminado!'}
          </Text>

          {tripStatus === 'idle' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vehicles.map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle.id && styles.vehicleCardActive,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle.id)}
                >
                  <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                  <Text
                    style={[
                      styles.vehicleLabel,
                      selectedVehicle === vehicle.id &&
                      styles.vehicleLabelActive,
                    ]}
                  >
                    {vehicle.label}
                  </Text>
                  <Text
                    style={[
                      styles.vehiclePrice,
                      selectedVehicle === vehicle.id &&
                      styles.vehicleLabelActive,
                    ]}
                  >
                    ${vehicle.price.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[
              styles.requestButton,
              tripStatus !== 'idle' && { backgroundColor: '#cccccc' },
            ]}
            onPress={handleRequestTrip}
            disabled={tripStatus !== 'idle'}
          >
            <Text style={styles.requestButtonText}>
              {tripStatus === 'idle' &&
                `Solicitar ${selectedVehicleData?.label
                } · $${selectedVehicleData?.price?.toLocaleString()}`}
              {tripStatus === 'requested' && 'Procesando...'}
              {tripStatus === 'driver_coming' && 'Tu conductor está cerca'}
              {tripStatus === 'in_trip' && 'Disfruta tu viaje'}
              {tripStatus === 'finished' && 'Pagar servicio'}
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
