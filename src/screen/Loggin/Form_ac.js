import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../utils/firebase"; // Firestore
import { addDoc, collection } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"; // Firebase Authentication
import { wp, hp } from "../../utils/ResponsiveUtils"; // Importamos utils responsivos

export default function Form_ac() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("+56");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleRegister = async () => {
    const auth = getAuth();

    if (!nombre || !rut || !correo || !telefono || !contraseña || !direccion) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    if (!validarCorreo(correo)) {
      Alert.alert("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    try {
      // Registro en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );
      const user = userCredential.user;

      // Enviar correo de verificación
      await sendEmailVerification(user);
      Alert.alert(
        "Correo de verificación enviado. Revise su bandeja de entrada."
      );

      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, "agenciacorretaje"), {
        nombre,
        rut,
        direccion,
        correo,
        telefono,
        uid: user.uid, // Vincula UID del usuario con Firestore
      });

      navigation.navigate("Loggin");
    } catch (error) {
      console.error("Error al registrar: ", error);
      Alert.alert("Error al registrar", error.message);
    }
  };

  const handleRutChange = (text) => {
    const validText = text.replace(/[^0-9kK]/g, ""); // Permitir solo números y la letra k
    setRut(validText);
  };

  const handleTelefonoChange = (text) => {
    if (!text.startsWith("+56")) {
      text = "+56" + text.replace(/[^0-9]/g, "");
    } else {
      text = "+56" + text.slice(3).replace(/[^0-9]/g, "");
    }
    setTelefono(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
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
              <Text style={styles.title}>Registro</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de Agencia</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre de la empresa"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rut empresa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el rut de la empresa"
                  value={rut}
                  onChangeText={handleRutChange}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresar correo"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese la dirección de la empresa"
                  value={direccion}
                  onChangeText={setDireccion}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={handleTelefonoChange}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Ingrese su contraseña"
                    value={contraseña}
                    onChangeText={setContraseña}
                    secureTextEntry={!showPassword}
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
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  logo: {
    width: wp("70%"),
    height: hp("20%"),
  },
  formContainer: {
    width: wp("85%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("8%"),
    padding: wp("5%"),
    marginBottom: hp("4%"),
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  inputGroup: {
    marginBottom: hp("2%"),
    width: "100%",
  },
  inputLabel: {
    fontSize: wp("4%"),
    marginBottom: hp("0.5%"),
  },
  input: {
    height: hp("6%"),
    borderRadius: wp("8%"),
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("4%"),
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: wp("8%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    height: hp("6%"),
  },
  passwordInput: {
    flex: 1,
    height: hp("6%"),
  },
  eyeButton: {
    padding: wp("2%"),
  },
  button: {
    borderRadius: wp("8%"),
    backgroundColor: "#009245",
    width: "65%",
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp("2%"),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
});
