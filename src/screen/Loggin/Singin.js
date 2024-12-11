
import React from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function Singin() {
  const [showPassword, setShowPassword] = React.useState(false);

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
              <Text style={styles.title}>ingrese su correo</Text>

              <TextInput style={styles.inputtext} placeholder="Ingrese su nombre" />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingrese su contraseña"
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
    top:"23%",
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
    width: "1%",
    paddingHorizontal: 85,
    top: "-15%",
    
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    margin: 5,
    top: "-30%",
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
  container2: {
    marginTop: "10%",
    width: "90%",
    top: "-18%",
    left: "5%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
});





