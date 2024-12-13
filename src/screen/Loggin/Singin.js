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
    <View style={{ flex: 1 }}>
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.containerAvoiding}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View>
              <Image
                style={styles.logo}
                source={require("../../../assets/images/INMOBINDER-03.png")}
              />
            </View>

            <View style={styles.container}>
              <Text style={styles.title}>Iniciar sesión</Text>

              <TextInput
                style={styles.inputtext}
                placeholder="Ingrese su nombre"
                value={correo}
                onChangeText={setCorreo}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingrese su contraseña"
                  secureTextEntry={!showPassword}
                  value={contraseña}
                  onChangeText={setContraseña}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#000000"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.buton} onPress={handleLogin}>
                <Text>Ingresar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    top: "23%",
  },
  containerAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: "10%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    height: "60%",
    margintop: "-10%",
  },
  logo: {
    height: 260,
    width: 260,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    top: "-1%",
  },
  inputtext: {
    height: 40,
    borderRadius: 30,
    top: "-5%",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    width: 300,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    top: "-20%",
    margin: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    margintbutton: "10%",
    top: "2%",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    width: "90%",
  },
  eyeButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 236,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    top: "10%",
    marginTop: "5%",
  },
});
