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
  StatusBar,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function Signin() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const navigation = useNavigation();
  const db = getFirestore();

  // Validar el formato del correo electrónico
  const validarCorreo = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Resetear errores al cambiar los campos
  const handleCorreoChange = (text) => {
    setCorreo(text);
    setEmailError("");
  };

  const handleContraseñaChange = (text) => {
    setContraseña(text);
    setPasswordError("");
  };

  const handleLogin = async () => {
    // Validaciones
    let isValid = true;
    
    if (!correo) {
      setEmailError("Por favor, ingrese su correo electrónico");
      isValid = false;
    } else if (!validarCorreo(correo)) {
      setEmailError("Formato de correo electrónico inválido");
      isValid = false;
    }
    
    if (!contraseña) {
      setPasswordError("Por favor, ingrese su contraseña");
      isValid = false;
    } else if (contraseña.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    }
    
    if (!isValid) return;

    setLoading(true);
    const auth = getAuth();
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setLoading(false);
        Alert.alert(
          "Correo no verificado",
          "Por favor, verifica tu correo antes de iniciar sesión.",
          [
            { 
              text: "Reenviar verificación", 
              onPress: async () => {
                try {
                  await user.sendEmailVerification();
                  Alert.alert("Correo enviado", "Se ha enviado un nuevo correo de verificación");
                } catch (error) {
                  Alert.alert("Error", "No se pudo enviar el correo de verificación");
                }
              } 
            },
            { text: "Aceptar" }
          ]
        );
        return;
      }

      const uid = user.uid;

      // Consultar Firestore para determinar el tipo de usuario
      try {
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

        setLoading(false);

        if (!usersSnapshot.empty) {
          console.log("Documento encontrado en 'users':", usersSnapshot.docs[0].data());
          Alert.alert("Éxito", "Bienvenido persona natural.");
          navigation.navigate("Home");
        } else if (!inmobiliariaSnapshot.empty) {
          console.log("Documento encontrado en 'inmobiliaria':", inmobiliariaSnapshot.docs[0].data());
          Alert.alert("Éxito", "Bienvenido inmobiliaria.");
          navigation.navigate("Home");
        } else if (!corredorSnapshot.empty) {
          console.log("Documento encontrado en 'corredor':", corredorSnapshot.docs[0].data());
          Alert.alert("Éxito", "Bienvenido corredor.");
          navigation.navigate("Home");
        } else if (!agenciacorretajeSnapshot.empty) {
          console.log("Documento encontrado en 'agenciacorretaje':", agenciacorretajeSnapshot.docs[0].data());
          Alert.alert("Éxito", "Bienvenido agencia de corretaje.");
          navigation.navigate("Home");
        } else {
          Alert.alert("Error", "No se encontró información del usuario.");
        }
      } catch (error) {
        setLoading(false);
        console.error("Error al consultar colecciones:", error);
        Alert.alert("Error", "Error al buscar información del usuario. Por favor, intente nuevamente.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error de inicio de sesión:", error);
      
      let errorMessage;
      switch(error.code) {
        case "auth/wrong-password":
          setPasswordError("Contraseña incorrecta");
          errorMessage = "Contraseña incorrecta. Intente nuevamente.";
          break;
        case "auth/user-not-found":
          setEmailError("No existe cuenta con este correo");
          errorMessage = "No existe una cuenta con este correo.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos incorrectos. Intente más tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifique su internet.";
          break;
        default:
          errorMessage = "Error al iniciar sesión. Intente nuevamente.";
      }
      
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

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.inputText, emailError ? styles.inputError : null]}
                    placeholder="Ingrese su correo"
                    value={correo}
                    onChangeText={handleCorreoChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                  <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Ingrese su contraseña"
                      secureTextEntry={!showPassword}
                      value={contraseña}
                      onChangeText={handleContraseñaChange}
                      autoCapitalize="none"
                      autoCorrect={false}
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
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Ingresar</Text>
                  )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    color: "#25272B",
    marginBottom: hp("3%"),
  },
  inputContainer: {
    width: "100%",
    marginBottom: hp("1.5%"),
  },
  inputText: {
    height: hp("6%"),
    width: "100%",
    borderRadius: wp("8%"),
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("4%"),
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: wp("3%"),
    marginTop: 5,
    marginLeft: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: hp("6%"),
    borderRadius: wp("8%"),
    borderWidth: 1,
    borderColor: "#CCCCCC",
    paddingHorizontal: wp("4%"),
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    height: hp("5%"),
    backgroundColor: "#FFFFFF",
    padding: 0,
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