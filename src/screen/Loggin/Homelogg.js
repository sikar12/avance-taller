import React from "react";
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wp, hp } from "../../utils/ResponsiveUtils"; // Asumiendo esta ruta

export default function Homelogg() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require("../../../assets/images/INMOBINDER-03.png")}
            resizeMode="contain"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate("Singin")}
          >
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("10%"),
    marginBottom: hp("5%"),
  },
  logo: {
    width: wp("70%"),
    height: hp("25%"),
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp("10%"),
  },
  button: {
    borderRadius: wp("8%"),
    backgroundColor: "#FDFDFD",
    width: wp("65%"),
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("2%"),
  },
  buttonText: {
    color: "#014C24",
    fontSize: wp("5%"),
    fontWeight: "500",
  },
});