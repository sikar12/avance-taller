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
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../utils/firebase"; // Importar auth desde la configuración
import { addDoc, collection } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"; // Ya no necesitamos importar getAuth
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function FormInmo() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("+56");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const validarContraseña = (contraseña) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(contraseña);
  };

  const validarRut = (rut) => {
    if (!rut) return false;
    
    // Eliminar puntos y guión
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Obtener dígito verificador
    const dv = rut.slice(-1);
    const rutNumero = parseInt(rut.slice(0, -1), 10);
    
    // Algoritmo para calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    // Calcular suma ponderada
    let rutReverso = String(rutNumero).split('').reverse().join('');
    for (let i = 0; i < rutReverso.length; i++) {
      suma += parseInt(rutReverso.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    // Calcular dígito verificador
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
    
    // Comparar con el dígito ingresado
    return dv.toUpperCase() === dvEsperado;
  };
  
  const formatearRut = (rut) => {
    // Eliminar caracteres no válidos
    rut = rut.replace(/[^0-9kK]/g, "");
    
    if (rut.length <= 1) return rut;
    
    // Separar el dígito verificador
    const dv = rut.slice(-1);
    let numero = rut.slice(0, -1);
    
    // Agregar puntos
    numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return `${numero}-${dv}`;
  };

  const handleRegister = async () => {
    // Validaciones previas
    if (!nombre || !rut || !correo || !telefono || !contraseña || !direccion) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (!validarCorreo(correo)) {
      Alert.alert("Error", "Por favor, ingrese un correo electrónico válido.");
      return;
    }

    if (!validarRut(rut)) {
      Alert.alert("Error", "Por favor, ingrese un RUT válido.");
      return;
    }

    if (!validarContraseña(contraseña)) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    if (telefono.length !== 11) { // +56 + 9 dígitos
      Alert.alert("Error", "Por favor, ingrese un número telefónico válido de 9 dígitos.");
      return;
    }

    setLoading(true);
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
      
      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, "inmobiliaria"), {
        nombre,
        rut: formatearRut(rut),
        direccion,
        correo,
        telefono,
        uid: user.uid, // Vincula UID del usuario con Firestore
        createdAt: new Date()
      });

      // Mostrar alerta con botón para navegar
      Alert.alert(
        "Verificación de correo",
        "Se ha enviado un correo de verificación. Por favor, verifique su cuenta y luego inicie sesión.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Singin")
          }
        ]
      );
    } catch (error) {
      console.error("Error al registrar: ", error);
      
      // Mensajes de error específicos
      switch(error.code) {
        case 'auth/email-already-in-use':
          Alert.alert("Error", "Este correo electrónico ya está registrado.");
          break;
        case 'auth/invalid-email':
          Alert.alert("Error", "El formato del correo electrónico no es válido.");
          break;
        case 'auth/weak-password':
          Alert.alert("Error", "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
          break;
        case 'auth/api-key-not-valid':
          Alert.alert("Error de configuración", "Hay un problema con la configuración de Firebase. Contacte al administrador.");
          break;
        default:
          Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRutChange = (text) => {
    const validText = text.replace(/[^0-9kK]/g, ""); // Permitir solo números y la letra k
    setRut(validText);
  };

  const handleTelefonoChange = (text) => {
    // Mantener el prefijo +56
    if (!text.startsWith("+56")) {
      text = "+56" + text.replace(/[^0-9]/g, "");
    } else {
      text = "+56" + text.slice(3).replace(/[^0-9]/g, "");
    }
    
    // Limitar a 11 caracteres (incluido el +56)
    if (text.length > 11) {
      text = text.substring(0, 11);
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
          style={{ flex: 1 }}
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
                <Text style={styles.inputLabel}>Nombre de empresa</Text>
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
                  >
                    <Icon
                      name={showPassword ? "eye" : "eye-off"}
                      size={24}
                      color="#000000"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordHelper}>
                  Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.disabledButton]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
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
  passwordHelper: {
    fontSize: wp("3%"),
    color: "#666",
    marginTop: hp("0.5%"),
    paddingHorizontal: wp("2%"),
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
  disabledButton: {
    backgroundColor: "#88C7A7", // Un verde más claro para indicar deshabilitado
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
});