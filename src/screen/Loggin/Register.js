import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wp, hp } from "../../utils/ResponsiveUtils"; // Asumiendo esta ruta

const Register = () => {
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

          <View style={styles.container}>
            <Text style={styles.title}>Registrarse como</Text>

            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate("Inmo")}
            >
              <Text style={styles.buttonText}>Inmobiliaria</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate("Ac")}
            >
              <Text style={styles.buttonText}>Agencia de Corretaje</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <Text style={styles.transparentText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Singin")}>
                <Text style={styles.texto3}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "150%",
    top: hp("10%"),
    
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
    
  },
  logo: {
    width: wp("70%"),
    height: hp("25%"),
    top: hp("-5%"),
   
  },
  container: {
    width: wp("85%"),
    borderRadius: wp("8%"),
    backgroundColor: "#FFFFFF",
    padding: wp("5%"),
    alignItems: "center",
    marginBottom: hp("5%"),
    top: hp("10%"),
    left: wp("7%"),
    
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    marginVertical: hp("2%"),
  },
  button: {
    borderRadius: wp("8%"),
    backgroundColor: "#009245",
    width: wp("65%"),
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("1.5%"),
  },
  buttonText: {
    color: "#F8F8FF",
    fontSize: wp("4.5%"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("3%"),
    width: "100%"
  },
  transparentText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: wp("4%"),
    marginRight: wp("2%"),
  },
  texto3: {
    color: "#009245",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
});

export default Register;