import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
  Text,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const Menu = () => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState({
    nombre: "Cargando...",
    rut: "Cargando..."
  });
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(""); // Para almacenar el tipo de usuario
  const navigation = useNavigation();
  
  useEffect(() => {
    fetchUserData();
    
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        setUserData({
          nombre: "No hay sesión",
          rut: "Inicie sesión"
        });
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setUserData({
          nombre: "No hay sesión",
          rut: "Inicie sesión"
        });
        setLoading(false);
        return;
      }
      
      const db = getFirestore();
      const uid = user.uid;
      
      const collections = ["users", "inmobiliaria", "corredor", "agenciacorretaje"];
      let foundUser = false;
      
      for (const collectionName of collections) {
        try {
          const userQuery = query(
            collection(db, collectionName),
            where("uid", "==", uid)
          );
          
          const snapshot = await getDocs(userQuery);
          
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            
            let nombre, rut;
            
            if (collectionName === "users") {
              nombre = data.nombre || "Usuario";
              rut = data.rut || "";
              setUserType("users");
            } else if (collectionName === "inmobiliaria") {
              nombre = data.nombreEmpresa || "Inmobiliaria";
              rut = data.rutEmpresa || "";
              setUserType("inmobiliaria");
            } else if (collectionName === "corredor") {
              nombre = data.nombre || "Corredor";
              rut = data.rut || "";
              setUserType("corredor");
            } else if (collectionName === "agenciacorretaje") {
              nombre = data.razonSocial || "Agencia";
              rut = data.rut || "";
              setUserType("agenciacorretaje");
            }
            
            if (!nombre || nombre === "Usuario" || nombre === "Inmobiliaria" || 
                nombre === "Corredor" || nombre === "Agencia") {
              
              const nombreCampos = ["nombre", "nombreEmpresa", "razonSocial", "name"];
              const rutCampos = ["rut", "rutEmpresa", "documento", "identificacion"];
              
              for (const campo of nombreCampos) {
                if (data[campo] && typeof data[campo] === 'string') {
                  nombre = data[campo];
                  break;
                }
              }
              
              for (const campo of rutCampos) {
                if (data[campo] && typeof data[campo] === 'string') {
                  rut = data[campo];
                  break;
                }
              }
            }
            
            setUserData({
              nombre: nombre || "Usuario",
              rut: rut || "Sin RUT",
              ...data // Guardar todos los datos para pasarlos a la pantalla de perfil
            });
            
            foundUser = true;
            break;
          }
        } catch (error) {
          console.error(`Error al buscar en ${collectionName}:`, error);
          Alert.alert(
            "Error al cargar datos", 
            `No se pudieron obtener tus datos de usuario desde ${collectionName}. Por favor, intenta nuevamente.`
          );
        }
      }
      
      if (!foundUser) {
        setUserData({
          nombre: user.email || "Usuario",
          rut: "Usuario no encontrado en BD"
        });
        setUserType("");
      }
    } catch (error) {
      console.error("Error general al obtener datos del usuario:", error);
      Alert.alert(
        "Error de conexión", 
        "No se pudieron cargar los datos de tu perfil. Verifica tu conexión a internet e intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setMenuVisible(false);
      // Navegar a la pantalla de login
      navigation.navigate("Homelogg");
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión: " + error.message);
    }
  };

  const toggleMenu = () => {
    if (!isMenuVisible) {
      fetchUserData();
    }
    setMenuVisible(!isMenuVisible);
  };

  const handleNavigation = (screenName) => {
    setMenuVisible(false);
    
    // Manejar cierre de sesión
    if (screenName === "logout") {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro que deseas cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Sí, cerrar sesión",
            onPress: handleLogout
          }
        ]
      );
      return;
    }
    
    // Navegar a la pantalla correspondiente
    if (screenName === "Porfileseting") {
      navigation.navigate("Porfileseting", { 
        userData: userData,
        userType: userType
      });
    } else if (screenName === "ListProject") {
      navigation.navigate("ListProject");
    } else if (screenName === "AddPublication") {
      navigation.navigate("AddPublication");
    } else if (screenName === "AddProject") {
      navigation.navigate("AddProject");
    } else if (screenName === "Meeting_date") {
      navigation.navigate("Meeting_date");
    } else if (screenName === "Employed") {
      navigation.navigate("Employed");
    } else if (screenName === "Settings") {
      navigation.navigate("Settings");
    }
  };

  // Opciones del menú con sus iconos
  const menuOptions = [
    { id: 1, title: "Mi perfil", icon: "person-outline", screen: "Porfileseting" },
    { id: 2, title: "Mis publicaciones", icon: "list-outline", screen: "ListProject" },
    { id: 3, title: "Añadir publicación", icon: "add-circle-outline", screen: "AddPublication" },
    { id: 4, title: "Añadir Proyecto", icon: "home-outline", screen: "AddProject" },
    { id: 5, title: "Agenda", icon: "calendar-outline", screen: "Meeting_date" },
    { id: 6, title: "Agentes", icon: "people-outline", screen: "Employed" },
    { id: 7, title: "Configuración", icon: "settings-outline", screen: "Settings" },
    { id: 8, title: "Cerrar sesión", icon: "log-out-outline", screen: "logout" }
  ];

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.button}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/Perfil.png")}
            style={styles.profileIcon}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
          <View style={styles.menuContainer}>
            <View style={styles.menu}>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Ionicons name="close-outline" size={24} color="black" />
              </TouchableOpacity>
              
              <View style={styles.profileContainer}>
                <Image
                  source={require("../../../assets/Perfil.png")}
                  style={styles.profile}
                />
                <Text style={styles.titulo}>
                  {loading ? "Cargando..." : userData.nombre}
                </Text>
                <Text style={styles.subtitulo}>
                  {loading ? "Cargando..." : userData.rut}
                </Text>
              </View>
              
              <View style={styles.menuOptionsContainer}>
                {menuOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.id} 
                    style={[
                      styles.menuItem,
                      option.screen === "logout" ? styles.logoutMenuItem : null
                    ]}
                    onPress={() => handleNavigation(option.screen)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={option.screen === "logout" ? "#CC0000" : "#009245"} 
                    />
                    <Text style={[
                      styles.menuItemText,
                      option.screen === "logout" ? styles.logoutText : null
                    ]}>
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    right: 20,
    backgroundColor: "#D7DBDD",
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    overflow: "hidden",
    width: 44,
    height: 44,
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  menuContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.9,
    maxWidth: 350,
  },
  menu: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#000",
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
  },
  profile: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#009245",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 5,
  },
  menuOptionsContainer: {
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
  },
  logoutMenuItem: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    color: "#CC0000",
  }
});

export default Menu;