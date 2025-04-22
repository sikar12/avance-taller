import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function ProfileSetting() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState("");

  // Campos de perfil
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [camposEditados, setCamposEditados] = useState({});

  // Variable para almacenar la referencia del documento
  const [userDocRef, setUserDocRef] = useState(null);
  const [userDocData, setUserDocData] = useState(null);

  useEffect(() => {
    cargarDatosPerfil();
    
    // Debug: Mostrar el estado de autenticación
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      console.log("Usuario autenticado:", user.email);
      console.log("UID:", user.uid);
    } else {
      console.log("No hay usuario autenticado");
    }
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No hay usuario autenticado");
        navigation.navigate("Signin");
        return;
      }

      // Guardar el correo del usuario autenticado
      setCorreo(user.email || "");
      
      const db = getFirestore();
      const uid = user.uid;
      
      // Verificar en qué colección está el usuario
      const collections = ["users", "inmobiliaria", "corredor", "agenciacorretaje"];
      
      let userData = null;
      let userCollection = "";
      let docRef = null;

      // Buscar en todas las colecciones posibles
      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName),
          where("uid", "==", uid)
        );
        
        const snapshot = await getDocs(userQuery);
        
        if (!snapshot.empty) {
          userData = snapshot.docs[0].data();
          docRef = doc(db, collectionName, snapshot.docs[0].id);
          userCollection = collectionName;
          
          console.log(`Usuario encontrado en colección: ${collectionName}`);
          console.log("Datos del usuario:", JSON.stringify(userData, null, 2));
          break;
        }
      }

      if (!userData) {
        Alert.alert("Error", "No se encontraron datos del usuario");
        return;
      }

      // Guardar referencias para actualización posterior
      setUserDocRef(docRef);
      setUserDocData(userData);
      setUserType(userCollection);

      // Extraer y mostrar datos según el tipo de usuario
      if (userCollection === "users") {
        // Personas naturales
        setNombres(userData.nombre || "");
        setApellidos(userData.apellidos || "");
        setRut(userData.rut || "");
        setTelefono(userData.telefono || "");
      } else if (userCollection === "inmobiliaria") {
        // Inmobiliarias
        setNombres(userData.nombreEmpresa || userData.nombre || "");
        setApellidos(userData.representanteLegal || "");
        setRut(userData.rutEmpresa || userData.rut || "");
        setTelefono(userData.telefono || userData.telefonoContacto || "");
      } else if (userCollection === "corredor") {
        // Corredores
        setNombres(userData.nombre || "");
        setApellidos(userData.apellidos || "");
        setRut(userData.rut || "");
        setTelefono(userData.telefono || userData.telefonoContacto || "");
      } else if (userCollection === "agenciacorretaje") {
        // Agencias de corretaje
        setNombres(userData.nombre ||"");
        setApellidos(userData.direccion || ""); // Usar dirección en lugar de apellidos/representante legal
        setRut(userData.rut || "");
        setTelefono(userData.telefono || userData.telefonoContacto || "");
      }

      // Si los campos siguen vacíos, buscar en propiedades alternativas
      if (!nombres) {
        const nombreCampos = ["nombre", "nombreEmpresa", "razonSocial", "name"];
        for (const campo of nombreCampos) {
          if (userData[campo] && typeof userData[campo] === 'string') {
            setNombres(userData[campo]);
            break;
          }
        }
      }

      if (!apellidos) {
        const apellidosCampos = ["apellidos", "representanteLegal", "apellido", "lastName"];
        for (const campo of apellidosCampos) {
          if (userData[campo] && typeof userData[campo] === 'string') {
            setApellidos(userData[campo]);
            break;
          }
        }
      }

      if (!rut) {
        const rutCampos = ["rut", "rutEmpresa", "documento", "identificacion"];
        for (const campo of rutCampos) {
          if (userData[campo] && typeof userData[campo] === 'string') {
            setRut(userData[campo]);
            break;
          }
        }
      }

      if (!telefono) {
        const telefonoCampos = ["telefono", "telefonoContacto", "phone", "celular", "movil"];
        for (const campo of telefonoCampos) {
          if (userData[campo] && typeof userData[campo] === 'string') {
            setTelefono(userData[campo]);
            break;
          }
        }
      }

      // Información de diagnóstico que se muestra al usuario si faltan datos
      if (!nombres || !apellidos || !rut) {
        console.warn("Algunos campos están vacíos después de intentar cargarlos");
        console.warn(`Nombres: ${nombres}, Apellidos: ${apellidos}, RUT: ${rut}, Teléfono: ${telefono}`);
      }
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPerfil = async () => {
    if (!userDocRef) {
      Alert.alert("Error", "No se encontró referencia al documento del usuario");
      return;
    }

    try {
      setSaving(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }

      // Si el correo ha cambiado, reautenticar y actualizar
      if (correo !== user.email) {
        // Se requiere contraseña actual para actualizar correo
        if (!currentPassword) {
          Alert.alert(
            "Se requiere contraseña", 
            "Por favor, ingrese su contraseña actual para cambiar el correo electrónico",
            [
              {
                text: "OK",
                onPress: () => {
                  // Aquí podrías mostrar un modal para ingresar la contraseña
                  Alert.prompt(
                    "Contraseña actual",
                    "Ingrese su contraseña actual",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel"
                      },
                      {
                        text: "Confirmar",
                        onPress: (password) => {
                          setCurrentPassword(password);
                          // Reintenta la actualización
                          actualizarPerfil();
                        }
                      }
                    ],
                    "secure-text"
                  );
                }
              }
            ]
          );
          setSaving(false);
          return;
        }

        // Reautenticar antes de cambiar correo
        try {
          const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, correo);
        } catch (error) {
          console.error("Error al actualizar correo:", error);
          Alert.alert("Error", "No se pudo actualizar el correo electrónico. Verifique su contraseña.");
          setSaving(false);
          return;
        }
      }

      // Actualizar datos en Firestore según el tipo de usuario
      const dataToUpdate = {};
      
      if (userType === "users") {
        dataToUpdate.nombre = nombres;
        dataToUpdate.apellidos = apellidos;
        dataToUpdate.rut = rut;
        dataToUpdate.telefono = telefono;
      } else if (userType === "inmobiliaria") {
        dataToUpdate.nombreEmpresa = nombres;
        dataToUpdate.representanteLegal = apellidos;
        dataToUpdate.rutEmpresa = rut;
        dataToUpdate.telefono = telefono;
      } else if (userType === "corredor") {
        dataToUpdate.nombre = nombres;
        dataToUpdate.apellidos = apellidos;
        dataToUpdate.rut = rut;
        dataToUpdate.telefono = telefono;
      } else if (userType === "agenciacorretaje") {
        dataToUpdate.nombre = nombres;
        dataToUpdate.direccion = apellidos; // Guardar como dirección en lugar de representanteLegal
        dataToUpdate.rut = rut;
        dataToUpdate.telefono = telefono;
      }
      
      await updateDoc(userDocRef, dataToUpdate);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil: " + error.message);
    } finally {
      setSaving(false);
      setCurrentPassword("");
    }
  };

  const volver = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          style={styles.background}
          source={require("../../../assets/images/Group.png")}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009245" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
  
  // Si no hay datos cargados después de que loading es false, mostrar mensaje alternativo
  if (!loading && (!userDocRef || !userDocData)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          style={styles.background}
          source={require("../../../assets/images/Group.png")}
        >
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
            <Text style={styles.errorTitle}>No se encontraron datos</Text>
            <Text style={styles.errorText}>
              No pudimos encontrar la información de tu perfil. Esto puede deberse a un problema
              de conexión o a que tu sesión ha expirado.
            </Text>
            <TouchableOpacity 
              style={styles.errorButton}
              onPress={() => {
                // Intenta cargar nuevamente
                cargarDatosPerfil();
              }}
            >
              <Text style={styles.errorButtonText}>Intentar nuevamente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.errorButton, styles.secondaryButton]}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : hp("5%")}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Editar Perfil</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {userType === "agenciacorretaje" ? "Nombre" : "Nombres"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={userType === "agenciacorretaje" ? "Nombre" : "Nombres"}
                  value={nombres}
                  onChangeText={(text) => {
                    setNombres(text);
                    setCamposEditados({...camposEditados, nombres: true});
                  }}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {userType === "agenciacorretaje" ? "Dirección" : "Apellidos"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={userType === "agenciacorretaje" ? "Dirección" : "Apellidos"}
                  value={apellidos}
                  onChangeText={(text) => {
                    setApellidos(text);
                    setCamposEditados({...camposEditados, apellidos: true});
                  }}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RUT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00.000.000-0"
                  value={rut}
                  onChangeText={(text) => {
                    setRut(text);
                    setCamposEditados({...camposEditados, rut: true});
                  }}
                  keyboardType="default"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChangeText={(text) => {
                    setCorreo(text);
                    setCamposEditados({...camposEditados, correo: true});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="912345678"
                  value={telefono}
                  onChangeText={(text) => {
                    setTelefono(text);
                    setCamposEditados({...camposEditados, telefono: true});
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonVolver} onPress={volver}>
                  <Text style={styles.buttonVolverText}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.buttonGuardar} 
                  onPress={actualizarPerfil}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.buttonGuardarText}>Aplicar Cambios</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    width: wp("85%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: wp("5%"),
    marginVertical: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonVolver: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CC0000",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  buttonVolverText: {
    color: "#CC0000",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonGuardar: {
    borderRadius: 25,
    backgroundColor: "#009245",
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
  },
  buttonGuardarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#009245',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#009245',
  },
  secondaryButtonText: {
    color: '#009245',
    fontSize: 16,
    fontWeight: '500',
  },
});