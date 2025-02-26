import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { wp, hp } from "../../utils/ResponsiveUtils"; // Asumiendo esta ruta

export default function Singin() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const db = getFirestore();

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Correo no verificado",
          "Por favor, verifica tu correo antes de iniciar sesión."
        );
        return;
      }

      const uid = user.uid;

      // Consultar Firestore para determinar el tipo de usuario
      const usersQuery = query(
        collection(db, "users"),
        where("uid", "==", uid)
      );
      const inmobiliariaQuery = query(
        collection(db, "inmobiliaria"),
        where("uid", "==", uid)
      );
      const corredorQuery = query(
        collection(db, "corredor"),
        where("uid", "==", uid)
      );
      const agenciacorretajeQuery = query(
        collection(db, "agenciacorretaje"),
        where("uid", "==", uid)
      );

      const [
        usersSnapshot,
        inmobiliariaSnapshot,
        corredorSnapshot,
        agenciacorretajeSnapshot,
      ] = await Promise.all([
        getDocs(usersQuery),
        getDocs(inmobiliariaQuery),
        getDocs(corredorQuery),
        getDocs(agenciacorretajeQuery),
      ]);

      if (!usersSnapshot.empty) {
        console.log(
          "Documento encontrado en 'users':",
          usersSnapshot.docs[0].data()
        );
        Alert.alert("Éxito", "Bienvenido persona natural.");
        navigation.navigate("Home");
      } else if (!inmobiliariaSnapshot.empty) {
        console.log(
          "Documento encontrado en 'inmobiliaria':",
          inmobiliariaSnapshot.docs[0].data()
        );
        Alert.alert("Éxito", "Bienvenido inmobiliaria.");
        navigation.navigate("Home");
      } else if (!corredorSnapshot.empty) {
        console.log(
          "Documento encontrado en 'corredor':",
          corredorSnapshot.docs[0].data()
        );
        Alert.alert("Éxito", "Bienvenido corredor.");
        navigation.navigate("Home");
      } else if (!agenciacorretajeSnapshot.empty) {
        console.log(
          "Documento encontrado en 'agenciacorretaje':",
          agenciacorretajeSnapshot.docs[0].data()
        );
        Alert.alert("Éxito", "Bienvenido agencia de corretaje.");
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "No se encontró información del usuario.");
      }
    } catch (error) {
      const errorMessage =
        error.code === "auth/wrong-password"
          ? "Contraseña incorrecta. Intente nuevamente."
          : error.code === "auth/user-not-found"
          ? "No existe una cuenta con este correo."
          : "Error al iniciar sesión. Intente nuevamente.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : hp("5%")}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  source={require("../../../assets/images/INMOBINDER-03.png")}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.title}>Iniciar sesión</Text>

                <TextInput
                  style={styles.inputText}
                  placeholder="Ingrese su correo"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Ingrese su contraseña"
                    secureTextEntry={!showPassword}
                    value={contraseña}
                    onChangeText={setContraseña}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Icon
                      name={showPassword ? "eye" : "eye-off"}
                      size={wp("6%")}
                      color="#000000"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("5%"),
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  logo: {
    width: wp("70%"),
    height: hp("25%"),
  },
  formContainer: {
    width: wp("85%"),
    padding: wp("5%"),
    borderRadius: wp("8%"),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    color: "#25272B",
    marginBottom: hp("3%"),
  },
  inputText: {
    height: hp("6%"),
    width: "90%",
    borderRadius: wp("8%"),
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: hp("6%"),
    borderRadius: wp("8%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    backgroundColor: "#FFFFFF",
    marginBottom: hp("4%"),
  },
  passwordInput: {
    flex: 1,
    height: hp("5%"),  // Reducido para que no desborde el contenedor
    backgroundColor: "#FFFFFF",
    padding: 0,  // Eliminar cualquier padding interno
  },
  eyeButton: {
    padding: wp("2%"),
  },
  button: {
    borderRadius: wp("8%"),
    backgroundColor: "#009245",
    width: wp("65%"),
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("2%"),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
});