import React from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../utils/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function Form_np() {
  const [nombre, setNombre] = React.useState("");
  const [apellido, setApellido] = React.useState("");
  const [rut, setRut] = React.useState("");
  const [correo, setCorreo] = React.useState("");
  const [telefono, setTelefono] = React.useState("+56");
  const [contraseña, setContraseña] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!nombre || !apellido || !rut || !correo || !telefono || !contraseña) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        nombre,
        apellido,
        rut,
        correo,
        telefono,
        contraseña,
      });
      Alert.alert("Registro exitoso");
      navigation.navigate("Verification");
    } catch (error) {
      console.error("Error al guardar los datos: ", error);
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
    <ImageBackground
      style={styles.background}
      source={require("../../../assets/images/Group.png")}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Image
            style={styles.logo}
            source={require("../../../assets/images/INMOBINDER-03.png")}
          />
        </View>

        <ScrollView style={styles.container}>
          <Text style={styles.title}>hola mundo</Text>

          <Text style={styles.Text}>Nombre</Text>
          <TextInput
            style={styles.inputtext}
            placeholder="Ingrese su nombre"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.Text}>Apellidos</Text>
          <TextInput
            style={styles.inputtext}
            placeholder="Ingrese su apellido"
            value={apellido}
            onChangeText={setApellido}
          />

          <Text style={styles.Text}>Rut</Text>
          <TextInput
            style={styles.inputtext}
            placeholder="Ingrese su Rut"
            value={rut}
            onChangeText={handleRutChange}
          />

          <Text style={styles.Text}>Correo electronico</Text>
          <TextInput
            style={styles.inputtext}
            placeholder="Ingrese su correo"
            value={correo}
            onChangeText={setCorreo}
          />

          <Text style={styles.Text}>Telefono</Text>
          <TextInput
            style={styles.inputtext}
            value={telefono}
            onChangeText={handleTelefonoChange}
            keyboardType="numeric"
          />

          <Text style={styles.Text}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingrese su contraseña"
              value={contraseña}
              onChangeText={setContraseña}
              secureTextEntry={!showPassword}
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

          <TouchableOpacity style={styles.buton} onPress={handleRegister}>
            <Text>Registrarse</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    top: "17%",
  },
  eyeButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginTop: "10%",
    width: "90%",
    top: "-18%",
    left: "5%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    height: 260,
    width: 260,
    justifyContent: "center",
    alignItems: "center",
    left: "16.5%",
    top: "-52%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    width: "90%",
    left: "5%",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    left: "1%",
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 236,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    left: "19%",
    marginTop: "5%",
    top: "4%",
  },
  Text: {
    marginTop: "3%",
    left: "5%",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    margin: 5,
  },
  inputtext: {
    height: 40,
    borderRadius: 30,
    left: "5%",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    width: "90%",
    paddingHorizontal: 15,
  },
});