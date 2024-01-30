import { View, Text } from "react-native";
import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Map from "./src/pages/Map";
import LocationPage from "./src/pages/Location";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Location" component={LocationPage} />
        <Stack.Screen name="Home" component={Map} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
