import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotonMenu from "../../components/RealState/Botonmenu";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
const MenuButton = () => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.button}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/Perfil.png")}
            style={styles.profileIcon}
            resizeMode="stretch"
          />
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
          <View style={styles.menu}>
            <View style={styles.profileContainer}>
              <Image
                source={require("../../../assets/Perfil.png")}
                style={styles.profile}
              />
              <Text style={styles.titulo}>11.111.111-1</Text>
              <Text style={styles.titulo}>Nombre</Text>
            </View>
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.menuItem}>
              <BotonMenu text="Mi perfil" onPress = {() => navigation.navigate("Perfil")} />
              <BotonMenu text="Mis publicaciones " />
              <BotonMenu
                text="Añadir proyecto "
                onPress={() => navigation.navigate("Add")}
              />
              <BotonMenu
                text="Mis proyectos"
                onPress={() => navigation.navigate("Pllist")}
              />
              <BotonMenu text="Configuración" />
              <BotonMenu text="Perfil" />

              <BotonMenu text="Cerrar sesión" 
              onPress={()=> navigation.navigate ("Singin")}/>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 46,
    left: 327,
    padding: 10,
    backgroundColor: "#D7DBDD",
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  menu: {
    width: 300, // Ancho fijo para el cuadrado
    height: 600,
    // Alto fijo para el cuadrado
    position: "absolute",
    left: 50,
    backgroundColor: "white",
    borderRadius: 20, // Bordes redondeados para el cuadrado
    padding: 20, // Espaciado interno
    justifyContent: "center", // Centra el contenido verticalmente dentro del cuadrado
    alignItems: "center", // Centra el contenido horizontalmente dentro del cuadrado
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  profile: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    borderRadius: 10,
  },
  modlastayle: {
    width: width * 0.8, // 80% del ancho de la pantalla
    height: width * 0.8, // Hace el modal cuadrado, ajusta según necesidad
    backgroundColor: "#FFF", // Fondo blanco para el modal
    borderRadius: 20, // Bordes redondeados
    padding: 20, // Espaciado interno
    justifyContent: "center", // Centra el contenido verticalmente dentro del modal
    alignItems: "center", // Centra el contenido horizontalmente dentro del modal
  },
});

export default MenuButton;
