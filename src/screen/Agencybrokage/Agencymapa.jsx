import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome6";
import MenuButton from "../RealState/Menu";
import IconMenuButton from "../Agencybrokage/Menubotton";

export default function Agencymapa() {
  const [origin, setOrigin] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    getLocationPermission(); // Obtener permiso de ubicación al montar el componente
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied");
      Alert.alert("Permission denied");
      return;
    }

    // Obtener la ubicación actual
    const location = await Location.getCurrentPositionAsync({});
    const currentLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setOrigin(currentLocation);
    setMarkerPosition(currentLocation);
    mapRef.current.animateToRegion({
      ...currentLocation,
      latitudeDelta: 0.09,
      longitudeDelta: 0.04,
    });
  };

  const goToOrigin = () => {
    if (origin && mapRef.current) {
      mapRef.current.animateToRegion({
        ...origin,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      });
      setMarkerPosition(origin);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: origin?.latitude || 19.432608, // Valor por defecto (Ciudad de México)
          longitude: origin?.longitude || -99.133209,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      ></MapView>

      <TouchableOpacity style={styles.button} onPress={goToOrigin}>
        <Icon style={styles.buttonText} name="location-crosshairs" />
      </TouchableOpacity>

      <IconMenuButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: "Blue",
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "green",
    padding: 14,
    borderRadius: 40,
    width: 50,
    height: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalView: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 20,
    padding: 10,
    alignItems: "flex-start",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button2: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 20,
    padding: 10,
    backgroundColor: "green",
    borderRadius: 40,
  },
});