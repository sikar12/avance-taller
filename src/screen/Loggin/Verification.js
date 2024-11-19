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

export default function Verification() {
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
        
        <View style = {styles.container}>
          <Text style = {styles.title}>Verificación de perfil</Text>
            <Text style = {styles.row}>Para poder verificar su perfil porfavor ingrese una fotocopia de su carnet 
                por ambos lados </Text>
            
            <TouchableOpacity style={styles.buton}>
                <Text style={styles.Text}> Selecionar archivo</Text>
            </TouchableOpacity>
        
        <Text style ={styles.texto2}>Tipos de archivos permitidos: PDF, DOC, DOX</Text>
        <Text style ={styles.texto2}>Tamaño máximo: 5MB</Text>


        </View>
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
    left: "20.5%",
    top: "-42%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    width: "90%",
    left: "4%",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 15,
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    left: "0%",
    marginTop: "5%",
    top: "-10%",
    margin: "5%",
  },
  Text: {
    marginTop: "3%",
    color: "#F8F8FF",
    
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
  
  row: {
    flexDirection: "row",
    alignItems: "center",
    margin: "10%",
    left: "5%",
    top: "-8%",
    
  },
    texto2: {
    top: "-10%",
    width:"49%",
    height:"5%",
    flexDirection: "row",
    left: "8%",
    fontSize: 7,
    },
});
