import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Button,
  SafeAreaView,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Geojson } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import COW from "../../assets/cow.png";
import {
  initDatabase,
  insertLocation,
  emptyUserLocation,
} from "../../sqlite.ts";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_TASK_NAME = "LOCATION_TASK_NAME";
let foregroundSubscription = null;

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      console.log("Location in background", location.coords);
    }
  }
});
export default function LocationPage({ navigation }) {
  const [location, setLocation] = useState([]);
  // AIzaSyAyiLjQV_a_-51OfNYhJZ3nCOx9H8aVWrQ
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted)
        await Location.requestBackgroundPermissionsAsync();
    };
    (async () => {
      const uuid = Crypto.randomUUID();
      AsyncStorage.getItem("uuid")
        .then(async (uuid_e) => {
          if (uuid_e) {
            return;
          }
          await AsyncStorage.setItem("uuid", uuid);
        })
        .catch(async (error) => {
          await AsyncStorage.setItem("uuid", uuid);
        });
    })();
    requestPermissions();
    initDatabase();
  }, []);
  const locationRef = useRef(null);

  useEffect(() => {
    // Inicializa la referencia a la ubicación actual
    const initializeLocationRef = async () => {
      const initialLocation = await Location.getCurrentPositionAsync({});
      locationRef.current = initialLocation;
      if (location.length === 0) {
        setLocation([initialLocation.coords]);
      }
    };

    initializeLocationRef();
  }, []);

  const haversineDistance = (coord1, coord2) => {
    const toRadians = (angle) => angle * (Math.PI / 180);

    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Radio de la Tierra en kilómetros (puedes ajustar esto según tus necesidades)
    const R = 6371;

    const distance = R * c;

    return distance;
  };

  const startForegroundUpdate = async () => {
    const { granted } = await Location.getForegroundPermissionsAsync();

    if (!granted) {
      console.log("location tracking denied");
      return;
    }

    locationRef.current = await Location.getCurrentPositionAsync({});

    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      async (location) => {
        const prevLocation = locationRef.current;

        // Calcula la distancia entre la ubicación actual y la anterior utilizando haversine
        const distance = haversineDistance(
          {
            latitude: prevLocation.coords.latitude,
            longitude: prevLocation.coords.longitude,
          },
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        );

        const umbralDistancia = 10 / 111000; // Ajusta según sea necesario
        const umbralVariacion = 0.0001; // Ajusta según sea necesario

        if (
          distance > umbralDistancia &&
          (Math.abs(location.coords.latitude - prevLocation.coords.latitude) >
            umbralVariacion ||
            Math.abs(
              location.coords.longitude - prevLocation.coords.longitude
            ) > umbralVariacion)
        ) {
          setLocation((prev) => [
            ...prev,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.045,
              longitudeDelta: 0.045,
            },
          ]);

          const uuid = await AsyncStorage.getItem("uuid");

          // insertLocation es una función que deberías tener definida en tu código
          insertLocation(
            location.coords.latitude,
            location.coords.longitude,
            Date.now(),
            "test",
            uuid
          );

          // Actualiza la referencia a la ubicación anterior
          locationRef.current = location;
        }
      }
    );
  };

  useEffect(() => {
    startForegroundUpdate();
    return;
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <Button
          title="Go to maps"
          onPress={() => navigation.navigate("Home")}
        />
        <View
          style={{
            flex: 1,
            width: "100%",
            height: 400,
          }}
        >
          <MapView
            zoomEnabled
            minZoomLevel={1}
            style={{ flex: 1, width: 500, height: 400, marginTop: 50 }}
            initialRegion={{
              latitude: 13.709163,
              longitude: -89.728202,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {location.length > 0 && (
              <>
                <Polyline
                  strokeColor="red"
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                  coordinates={location}
                />
                <Marker
                  coordinate={location[location.length - 1]}
                  title="Marker"
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("../../assets/cow.png")}
                  />
                </Marker>
                <Marker coordinate={location[0]} title="Marker"></Marker>
              </>
            )}
          </MapView>
        </View>

        <Button title="Vaciar tabla" onPress={emptyUserLocation} color="red" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
