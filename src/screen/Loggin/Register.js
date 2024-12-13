import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";


const Register = () => {



  const navigation = useNavigation();

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

      <View style={styles.container}>
        
        <Text style = {styles.title}> Registrarse como </Text>

        <TouchableOpacity style={styles.buton}  onPress={()=>navigation.navigate("Form_np")} >
          <Text style={styles.Text}>Persona natural</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buton} onPress ={()=>navigation.navigate("Inmo")}>
          <Text style={styles.Text}>Inmobilaria</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buton} onPress={()=>navigation.navigate("Co")}>
          <Text style={styles.Text}>Corredor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buton}onPress={()=>navigation.navigate("Ac")}>
          <Text style={styles.Text}>Agencia de Corretaje</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.transparentText}>¿Ya tienes cuena?</Text>
          <TouchableOpacity onPress = {()=>navigation.navigate("Singin")}>
            <Text style ={styles.texto3}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>


      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: "50%",
    resizeMode: "cover",
  },
  container: {
    height: "65%",
    width: "80%",
    top: "-20%",
    left: "10%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    height: 260,
    width: 260,
    justifyContent: "center",
    alignItems: "center",
    left: "16.5%",
    top: "-60%",
  },
  input: {
    marginTop: "10%",
    height: 40,
    borderRadius: 30,
    margin: 12,
    borderWidth: 1,
    backgroundColor: "#dcdcdc",
    width: "90%",
  },
  tamlogo: {
    justifyContent: "center",
    alignItems: "center",
    top: "-20%",
    height: "20%",
    width: "10",
    marginLeft: "40%",

    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 236,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    left: "15%",
    marginTop: "5%",
  },

  Text: {
    color: "#F8F8FF",
    fontSize: 20,
  },

  title: {
    fontSize: 30, // Tamaño de la fuente
    fontWeight: "bold", // Peso de la fuente
    color: "#25272B", // Color del texto
    textAlign: "center", // Alineación del texto
    margin: 5 // Margen vertical
  },

  texto2: {

  top: "40%",
  left: "30%",
  },

  texto3: {
   
    left: "65%",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    margin: "10%",
    left: "-5%",
    top: "10%",
  },
  
  transparentText: {
    color: "rgba(0, 0, 0, 0.5)", // Texto transparente
    fontSize: 16,
    left: "18%",
  },
});

export default Register;
