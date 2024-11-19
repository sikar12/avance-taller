import React from "react";
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Loggin  () {
  const navigation = useNavigation();

  return (
    <ImageBackground
      style={styles.background}
      source={require("../../../assets/images/Group.png")}
    >
      <View>
        <Image
          style={styles.logo}
          source={require("../../../assets/images/INMOBINDER-03.png")}
        />
      </View>

      <TouchableOpacity style={styles.buton}>
        <Text style={styles.Text}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buton}
        onPress={() => navigation.navigate("Register")} // Asegúrate de que el nombre de la ruta coincida
      >
        <Text style={styles.Text}>Registrarse</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: "50%",
    resizeMode: "cover",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: "10%",
    margin: 20,
    borderRadius: 30,
    marginBottom: "20%",
    height: "70%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  logo: {
    height: 260,
    width: 260,
    justifyContent: "center",
    alignItems: "center",
    left: "18%",
    top: "-60%",
  },
  input: {
    marginTop: "10%",
    height: 40,
    borderRadius: 30,
    margin: 12,
    borderWidth: 1,
    backgroundColor: "#dcdcdc",
    width: "90%",
  },
  tamlogo: {
    justifyContent: "center",
    alignItems: "center",
    top: "-20%",
    height: "20%",
    width: 10, // Cambiado a número
    marginLeft: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#FDFDFD",
    width: 236,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    top: "-10%",
    left: "20%",
    marginTop: "10%",
  },

  Text: {
    color: "#014C24",
    fontSize: 20,
  },
});
