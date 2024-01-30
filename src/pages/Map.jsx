import { View, Text, Image, SafeAreaView, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { get_by_uuid } from "../../sqlite.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Polyline, Geojson } from "react-native-maps";
const Map = () => {
  const [latitudes, setLatitudes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const getLatitude = async () => {
    const uuid = await AsyncStorage.getItem("uuid");
    const location = await get_by_uuid(uuid);
    console.log("Encontrado: ", location);
    setLatitudes(location);
  };

  useEffect(() => {
    (async () => await getLatitude())();
    return 
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Button
        title="Refresh"
        onPress={() => {
          setRefresh(true);
        }}
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
          {latitudes.length > 0 && (
            <>
              <Polyline
                strokeColor="red"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                coordinates={latitudes.map((item) => ({
                  latitude: item.latitude,
                  longitude: item.longitude,
                }))}
              />
              <Marker
                coordinate={latitudes[latitudes.length - 1]}
                title="Marker"
              >
                <Image
                  style={{ width: 30, height: 30 }}
                  source={require("../../assets/cow.png")}
                />
              </Marker>
              <Marker coordinate={latitudes[0]} title="Marker"></Marker>
            </>
          )}
        </MapView>
      </View>
    </SafeAreaView>
  );
};

export default Map;
