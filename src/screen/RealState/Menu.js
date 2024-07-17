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
            source={require("../../../assets/favicon.png")}
            style={styles.profileIcon}
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
                source={require("../../../assets/favicon.png")}
                style={styles.profile}
              />
              <Text style={styles.titulo}>11.111.111-1</Text>
              <Text style={styles.titulo}>Nombre</Text>
            </View>
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.menuItem}>
              <BotonMenu text="Mi perfil" />
              <BotonMenu text="Mis publicaciones " />
              <BotonMenu
                text="Añadir proyecto "
                onPress={() => navigation.navigate("Add")}
              />
              <BotonMenu text="Mis proyectos" />
              <BotonMenu text="Configuración" />
              <BotonMenu text="Perfil" />
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
    top: 40,
    right: 10,
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
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menu: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
});

export default MenuButton;
