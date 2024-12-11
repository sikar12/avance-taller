// import React from "react";
// import {
//   View,
//   Text,
//   ImageBackground,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Platform,
// } from "react-native";
// import { useState } from "react";
// import Icon from "react-native-vector-icons/Ionicons";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { useNavigation } from "@react-navigation/native";

// export default function Singin() {
//   const [correo, setCorreo] = useState("");
//   const [contraseña, setContraseña] = useState("");
//   const [showPassword, setShowPassword] = React.useState(false);
//   const navigation = useNavigation();
//   return (
//     <View style={{ flex: 1 }}>
//       <ImageBackground
//         style={styles.background}
//         source={require("../../../assets/images/Group.png")}
//       />
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <KeyboardAvoidingView
//           style={styles.containerAvoiding}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             <View>
//               <Image
//                 style={styles.logo}
//                 source={require("../../../assets/images/INMOBINDER-03.png")}
//               />
//             </View>

//             <View style={styles.container}>
//               <Text style={styles.title}>Iniciar sesión</Text>

//               <TextInput
//                 style={styles.inputtext}
//                 placeholder="Ingrese su nombre"
//               />

//               <View style={styles.passwordContainer}>
//                 <TextInput
//                   style={styles.passwordInput}
//                   placeholder="Ingrese su contraseña"
//                   secureTextEntry={!showPassword}
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.eyeButton}
//                 >
//                   <Icon
//                     name={showPassword ? "eye" : "eye-off"}
//                     size={24}
//                     color="#000000"
//                   />
//                 </TouchableOpacity>
//               </View>
//               <View>
//                 <TouchableOpacity
//                   style={styles.buton}
//                   onPress={() => navigation.navigate("Home")}
//                 >
//                   <Text>Ingresar</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//     top: "23%",
//   },
//   containerAvoiding: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   container: {
//     justifyContent: "center",
//     alignItems: "center",
//     padding: "10%",

//     borderRadius: 30,
//     backgroundColor: "#FFFFFF",
//     height: "60%",
//     margintop: "-10%",
//   },
//   logo: {
//     height: 260,
//     width: 260,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//     top: "-1%",
//   },
//   inputtext: {
//     height: 40,
//     borderRadius: 30,

//     borderWidth: 1,
//     backgroundColor: "#FFFFFF",
//     width: "1%",
//     paddingHorizontal: 85,
//     top: "-15%",
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: "bold",
//     color: "#25272B",
//     textAlign: "center",
//     margin: 5,
//     top: "-30%",
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     backgroundColor: "#FFFFFF",
//     width: "90%",
//   },
//   eyeButton: {
//     marginLeft: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   passwordInput: {
//     flex: 1,
//     height: 40,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 30,
//   },
//   container2: {
//     marginTop: "10%",
//     width: "90%",
//     top: "-18%",
//     left: "5%",
//     borderRadius: 30,
//     backgroundColor: "#FFFFFF",
//   },

//   buton: {
//     borderRadius: 30,
//     backgroundColor: "#009245",
//     width: 236,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",

//     marginTop: "5%",
//     top: "80%",
//   },
// });


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
import { useNavigation } from "@react-navigation/native";

export default function Singin() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

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

      Alert.alert("Éxito", "Inicio de sesión exitoso.");
      navigation.navigate("Home"); // Redirige a la pantalla principal
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

              <TouchableOpacity
                style={styles.buton}
                onPress={handleLogin}
              >
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

    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    width: "90%",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    margin: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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

    marginTop: "5%",
  },
});
