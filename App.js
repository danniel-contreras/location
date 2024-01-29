import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, Polyline, Geojson } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

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
export default function App() {

  const [location, setLocation] = useState([]);
  // AIzaSyAyiLjQV_a_-51OfNYhJZ3nCOx9H8aVWrQ
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted)
        await Location.requestBackgroundPermissionsAsync();
    };
    requestPermissions();
  }, []);

  const startForegroundUpdate = async () => {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      console.log("location tracking denied");
      return;
    }
    foregroundSubscription?.remove();

    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 500,
        distanceInterval: 10,
      },
      async (location) => {
        let regionName = await Location.reverseGeocodeAsync({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
        });

        setLocation((prev) => [
          ...prev,
          {
            latitude: location.coords?.latitude,
            longitude: location.coords?.longitude,
          },
        ]);
      }
    );
  };

  useEffect(() => {
    startForegroundUpdate();
    return;
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <MapView zoomEnabled minZoomLevel={1} style={styles.map}>
        {/* <MapViewDirections
          origin={location[0]}
          destination={location[location.length - 1]}
          apikey={"AIzaSyAyiLjQV_a_-51OfNYhJZ3nCOx9H8aVWrQ"}
          strokeWidth={5}
          strokeColor="hotpink"
        /> */}
        {location.map((marker, index) => (
          <Polyline
            strokeColors="hotpink"
            strokeWidth={10}
            strokeColor="red"
            coordinates={location}
            key={index}
          />
        ))}
      </MapView>
    </View>
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
