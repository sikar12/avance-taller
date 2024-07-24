import { StatusBar } from "expo-status-bar";
import { onSnapshot, or } from "firebase/firestore";
import * as React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import MapView, { Marker, POlyline } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome6";
import MenuButton from "./Menu";

// import Icon from "react-native-vector-icons/FontAwesome";

export default function Homemaps() {
  const [origin, setOrigin] = useState(null);
  const [markerPosition, setMarkerPosition] = React.useState({});
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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: origin && origin.latitude ? origin.latitude : 0,
          longitude: origin && origin.longitude ? origin.longitude : 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      ></MapView>

      <TouchableOpacity style={styles.button} onPress={goToOrigin}>
        <Icon style={styles.buttonText} name="location-crosshairs" />
      </TouchableOpacity>

      <MenuButton />
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
    backgroundColor: "green",
    padding: 14,
    borderRadius: 40,
    colorletter: "white",
    width: 50,
    height: 50,
    top: 670,
    left: 330,
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
    padding: 10,
    margin: 20,
    borderRadius: 40,
  },
});
