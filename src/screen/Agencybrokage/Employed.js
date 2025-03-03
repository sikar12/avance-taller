import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function Employed() {
  const navigation = useNavigation();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    telefono: "",
    cargo: ""
  });
  const [error, setError] = useState({});
  const [filtro, setFiltro] = useState("");
  const [userDocData, setUserDocData] = useState(null);
  const [userCollectionName, setUserCollectionName] = useState("");

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No hay usuario autenticado");
        navigation.navigate("Signin");
        return;
      }

      const db = getFirestore();
      const uid = user.uid;

      // Buscar la colección del usuario actual
      const collections = ["inmobiliaria", "agenciacorretaje"];
      let empleadosData = [];
      let userCollection = "";
      let userData = null;
      let userDocId = "";

      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName),
          where("uid", "==", uid)
        );
        
        const snapshot = await getDocs(userQuery);
        
        if (!snapshot.empty) {
          userCollection = collectionName;
          userData = snapshot.docs[0].data();
          userDocId = snapshot.docs[0].id;
          
          // Guardar la colección y el ID del usuario
          setUserCollectionName(collectionName);
          setUserDocData({
            id: userDocId,
            collection: collectionName,
            ...userData
          });
          
          // Buscar empleados asociados a este usuario
          const empleadosQuery = query(
            collection(db, `${collectionName}_empleados`),
            where("empleadorId", "==", userDocId)
          );
          
          const empleadosSnapshot = await getDocs(empleadosQuery);
          
          if (!empleadosSnapshot.empty) {
            empleadosData = empleadosSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          
          break;
        }
      }

      setEmpleados(empleadosData);
      console.log(`Se encontraron ${empleadosData.length} empleados en la colección ${userCollection}_empleados`);
      
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      Alert.alert("Error", "No se pudieron cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    const errores = {};
    
    if (!nuevoEmpleado.nombre.trim()) {
      errores.nombre = "El nombre es obligatorio";
    }
    
    if (!nuevoEmpleado.apellido.trim()) {
      errores.apellido = "El apellido es obligatorio";
    }
    
    if (!nuevoEmpleado.rut.trim()) {
      errores.rut = "El RUT es obligatorio";
    }
    
    if (!nuevoEmpleado.correo.trim()) {
      errores.correo = "El correo es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevoEmpleado.correo)) {
        errores.correo = "Formato de correo inválido";
      }
    }
    
    setError(errores);
    return Object.keys(errores).length === 0;
  };

  const agregarEmpleado = async () => {
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (!userDocData || !userCollectionName) {
        Alert.alert("Error", "No se encontró la información de su cuenta");
        return;
      }

      const db = getFirestore();
      
      // Agregar nuevo empleado
      const docRef = await addDoc(collection(db, `${userCollectionName}_empleados`), {
        ...nuevoEmpleado,
        empleadorId: userDocData.id,
        createdAt: serverTimestamp()
      });

      // Añadir el nuevo empleado a la lista local
      setEmpleados([
        ...empleados, 
        {
          id: docRef.id,
          ...nuevoEmpleado,
          empleadorId: userDocData.id
        }
      ]);

      // Limpiar el formulario y cerrar modal
      setNuevoEmpleado({
        nombre: "",
        apellido: "",
        rut: "",
        correo: "",
        telefono: "",
        cargo: ""
      });
      setModalVisible(false);
      
      Alert.alert("Éxito", "Empleado agregado correctamente");
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      Alert.alert("Error", "No se pudo agregar el empleado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpleado = async (empleadoId) => {
    try {
      console.log(`Intentando eliminar empleado con ID: ${empleadoId}`);
      
      if (!userCollectionName) {
        console.error("No se encontró la colección del usuario");
        Alert.alert("Error", "No se pudo determinar la colección para eliminar el empleado");
        return;
      }
      
      setLoading(true);
      const db = getFirestore();
      
      // Referencia al documento del empleado
      const empleadoRef = doc(db, `${userCollectionName}_empleados`, empleadoId);
      console.log(`Eliminando de la colección: ${userCollectionName}_empleados`);
      
      // Eliminar el documento
      await deleteDoc(empleadoRef);
      console.log("Documento eliminado correctamente de Firestore");
      
      // Actualizar el estado local para reflejar la eliminación
      const nuevosEmpleados = empleados.filter(emp => emp.id !== empleadoId);
      setEmpleados(nuevosEmpleados);
      console.log(`Lista de empleados actualizada: ${nuevosEmpleados.length} empleados`);
      
      Alert.alert("Éxito", "Empleado eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      Alert.alert("Error", "No se pudo eliminar el empleado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (empleado) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Está seguro que desea eliminar a ${empleado.nombre} ${empleado.apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => eliminarEmpleado(empleado.id)
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.employeeCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.nombre.charAt(0).toUpperCase()}{item.apellido.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.employeePosition}>{item.cargo || "Sin cargo asignado"}</Text>
        <Text style={styles.employeeContact}>{item.correo}</Text>
        <Text style={styles.employeeContact}>{item.telefono || "Sin teléfono"}</Text>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => {
          Alert.alert(
            "Opciones",
            "¿Qué deseas hacer con este empleado?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Editar", onPress: () => console.log("Editar empleado", item.id) },
              { 
                text: "Eliminar", 
                style: "destructive",
                onPress: () => confirmarEliminacion(item)
              }
            ]
          );
        }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const filtrarEmpleados = () => {
    if (!filtro.trim()) {
      return empleados;
    }
    
    const termino = filtro.toLowerCase();
    return empleados.filter(empleado => 
      empleado.nombre.toLowerCase().includes(termino) ||
      empleado.apellido.toLowerCase().includes(termino) ||
      empleado.cargo?.toLowerCase().includes(termino) ||
      empleado.correo.toLowerCase().includes(termino)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Empleados</Text>
      </View>
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empleado..."
            value={filtro}
            onChangeText={setFiltro}
          />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009245" />
            <Text style={styles.loadingText}>Cargando empleados...</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={filtrarEmpleados()}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>No hay empleados registrados</Text>
                  <Text style={styles.emptySubtext}>
                    Agrega empleados para empezar a gestionarlos
                  </Text>
                </View>
              }
            />
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Modal para agregar empleado */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Empleado</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={[styles.input, error.nombre && styles.inputError]}
                  placeholder="Nombre"
                  value={nuevoEmpleado.nombre}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, nombre: texto})}
                />
                {error.nombre && <Text style={styles.errorText}>{error.nombre}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Apellido *</Text>
                <TextInput
                  style={[styles.input, error.apellido && styles.inputError]}
                  placeholder="Apellido"
                  value={nuevoEmpleado.apellido}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, apellido: texto})}
                />
                {error.apellido && <Text style={styles.errorText}>{error.apellido}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RUT *</Text>
                <TextInput
                  style={[styles.input, error.rut && styles.inputError]}
                  placeholder="12.345.678-9"
                  value={nuevoEmpleado.rut}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, rut: texto})}
                />
                {error.rut && <Text style={styles.errorText}>{error.rut}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo *</Text>
                <TextInput
                  style={[styles.input, error.correo && styles.inputError]}
                  placeholder="correo@ejemplo.com"
                  value={nuevoEmpleado.correo}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, correo: texto})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {error.correo && <Text style={styles.errorText}>{error.correo}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+56 9 1234 5678"
                  value={nuevoEmpleado.telefono}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, telefono: texto})}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cargo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Vendedor, Asistente, Gerente"
                  value={nuevoEmpleado.cargo}
                  onChangeText={(texto) => setNuevoEmpleado({...nuevoEmpleado, cargo: texto})}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={agregarEmpleado}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    marginLeft: wp("3%"),
    color: "#333",
  },
  container: {
    flex: 1,
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    height: hp("6%"),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: wp("2%"),
  },
  searchInput: {
    flex: 1,
    height: hp("6%"),
    fontSize: wp("4%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: wp("4%"),
    color: "#666",
  },
  listContent: {
    paddingBottom: hp("10%"),
  },
  employeeCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: wp("4%"),
    marginBottom: hp("1.5%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#009245",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: wp("4.5%"),
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  employeePosition: {
    fontSize: wp("3.8%"),
    color: "#009245",
    fontWeight: "500",
    marginBottom: 5,
  },
  employeeContact: {
    fontSize: wp("3.5%"),
    color: "#666",
    marginBottom: 2,
  },
  moreButton: {
    justifyContent: "center",
    padding: wp("2%"),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp("10%"),
  },
  emptyText: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#666",
    marginTop: hp("2%"),
  },
  emptySubtext: {
    fontSize: wp("3.8%"),
    color: "#999",
    textAlign: "center",
    marginTop: hp("1%"),
    maxWidth: wp("70%"),
  },
  addButton: {
    position: "absolute",
    bottom: hp("3%"),
    right: wp("5%"),
    backgroundColor: "#009245",
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    width: wp("90%"),
    maxHeight: hp("80%"),
    padding: wp("5%"),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    maxHeight: hp("65%"),
  },
  inputGroup: {
    marginBottom: hp("1.5%"),
  },
  inputLabel: {
    fontSize: wp("3.8%"),
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    height: hp("5.5%"),
    paddingHorizontal: wp("3%"),
    fontSize: wp("4%"),
    backgroundColor: "#F9F9F9",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: wp("3.2%"),
    marginTop: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  cancelButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginRight: wp("2%"),
  },
  cancelButtonText: {
    color: "#666",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#009245",
    borderRadius: 8,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginLeft: wp("2%"),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
});