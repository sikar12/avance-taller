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
  Modal,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import {
  getAuth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function Meeting_date() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados para la fecha, hora y detalles de la reunión
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [meetingTime, setMeetingTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());
  const [meetingDetails, setMeetingDetails] = useState({
    titulo: "",
    descripcion: "",
    lugar: "",
  });

  // Estados para selección de empleado
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [showEmpleadosModal, setShowEmpleadosModal] = useState(false);
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
      console.log(`Se encontraron ${empleadosData.length} empleados disponibles para reuniones`);
      
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      Alert.alert("Error", "No se pudieron cargar los empleados disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const updateSelectedTime = () => {
    const newDate = new Date();
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    setMeetingTime(newDate);
    setShowTimeModal(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const toggleTimeModal = () => {
    setShowTimeModal(!showTimeModal);
  };

  const selectEmpleado = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowEmpleadosModal(false);
  };

  const guardarReunion = async () => {
    // Validaciones
    if (!selectedDate) {
      Alert.alert("Error", "Por favor selecciona una fecha para la reunión");
      return;
    }

    if (!selectedEmpleado) {
      Alert.alert("Error", "Por favor selecciona un empleado para la reunión");
      return;
    }

    if (!meetingDetails.titulo) {
      Alert.alert("Error", "Por favor ingresa un título para la reunión");
      return;
    }

    try {
      setSaving(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !userDocData) {
        Alert.alert("Error", "No se encontró información de usuario");
        return;
      }

      const db = getFirestore();
      
      // Formato de hora para guardar en Firestore
      const hours = meetingTime.getHours();
      const minutes = meetingTime.getMinutes();
      const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      
      // Estructura de la reunión
      const reunionData = {
        empleadoId: selectedEmpleado.id,
        empleadoNombre: `${selectedEmpleado.nombre} ${selectedEmpleado.apellido}`,
        empleadorId: userDocData.id,
        fecha: selectedDate,
        hora: formattedTime,
        titulo: meetingDetails.titulo,
        descripcion: meetingDetails.descripcion || "",
        lugar: meetingDetails.lugar || "",
        estado: "pendiente", // pendiente, confirmada, cancelada, realizada
        createdAt: serverTimestamp(),
        createdBy: user.uid
      };

      // Guardar en Firestore
      await addDoc(collection(db, "reuniones"), reunionData);

      Alert.alert(
        "Éxito", 
        "Reunión agendada correctamente",
        [
          { 
            text: "OK", 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error("Error al guardar reunión:", error);
      Alert.alert("Error", "No se pudo agendar la reunión: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderEmpleadoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.empleadoItem}
      onPress={() => selectEmpleado(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.nombre.charAt(0).toUpperCase()}{item.apellido.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.empleadoInfo}>
        <Text style={styles.empleadoNombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.empleadoCargo}>{item.cargo || "Sin cargo asignado"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        style={styles.background}
        source={require("../../../assets/images/Group.png")}
        resizeMode="cover"
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
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agendar Reunión</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#009245" />
                <Text style={styles.loadingText}>Cargando datos...</Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Selección de empleado */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Seleccionar Empleado</Text>
                  
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => setShowEmpleadosModal(true)}
                  >
                    {selectedEmpleado ? (
                      <View style={styles.selectedItem}>
                        <View style={styles.miniAvatar}>
                          <Text style={styles.miniAvatarText}>
                            {selectedEmpleado.nombre.charAt(0).toUpperCase()}
                            {selectedEmpleado.apellido.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.selectedText}>
                          {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="person-outline" size={22} color="#666" />
                        <Text style={styles.placeholderText}>Seleccionar empleado</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-down" size={22} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Selección de fecha */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fecha de la Reunión</Text>
                  
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={toggleCalendar}
                  >
                    {selectedDate ? (
                      <View style={styles.selectedItem}>
                        <Ionicons name="calendar" size={22} color="#009245" />
                        <Text style={styles.selectedText}>
                          {new Date(selectedDate).toLocaleDateString()}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="calendar-outline" size={22} color="#666" />
                        <Text style={styles.placeholderText}>Seleccionar fecha</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-down" size={22} color="#666" />
                  </TouchableOpacity>
                  
                  {showCalendar && (
                    <View style={styles.calendarContainer}>
                      <Calendar
                        onDayPress={handleDateSelect}
                        markedDates={{
                          [selectedDate]: {selected: true, selectedColor: '#009245'}
                        }}
                        minDate={new Date().toISOString().split('T')[0]}
                        theme={{
                          todayTextColor: '#009245',
                          arrowColor: '#009245',
                          dotColor: '#009245',
                          selectedDayBackgroundColor: '#009245',
                        }}
                      />
                    </View>
                  )}
                </View>

                {/* Selección de hora */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hora de la Reunión</Text>
                  
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={toggleTimeModal}
                  >
                    <View style={styles.selectedItem}>
                      <Ionicons name="time" size={22} color="#009245" />
                      <Text style={styles.selectedText}>
                        {meetingTime.getHours().toString().padStart(2, '0')}:
                        {meetingTime.getMinutes().toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={22} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Detalles de la reunión */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Detalles de la Reunión</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Título</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Título de la reunión"
                      value={meetingDetails.titulo}
                      onChangeText={(text) => setMeetingDetails({...meetingDetails, titulo: text})}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lugar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Lugar de la reunión"
                      value={meetingDetails.lugar}
                      onChangeText={(text) => setMeetingDetails({...meetingDetails, lugar: text})}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Descripción</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Detalles adicionales"
                      value={meetingDetails.descripcion}
                      onChangeText={(text) => setMeetingDetails({...meetingDetails, descripcion: text})}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.buttonCancel} 
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.buttonCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.buttonSave} 
                    onPress={guardarReunion}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.buttonSaveText}>Agendar Reunión</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* Modal para seleccionar hora */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: hp("40%") }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Hora</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Hora</Text>
                <ScrollView style={styles.timePickerScroll}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timePickerItem,
                        selectedHour === i && styles.timePickerItemSelected
                      ]}
                      onPress={() => setSelectedHour(i)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedHour === i && styles.timePickerItemTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Minuto</Text>
                <ScrollView style={styles.timePickerScroll}>
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timePickerItem,
                        selectedMinute === i && styles.timePickerItemSelected
                      ]}
                      onPress={() => setSelectedMinute(i)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedMinute === i && styles.timePickerItemTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.timeConfirmButton}
              onPress={updateSelectedTime}
            >
              <Text style={styles.timeConfirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal para seleccionar empleado */}
      <Modal
        visible={showEmpleadosModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmpleadosModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Empleado</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEmpleadosModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={empleados}
              renderItem={renderEmpleadoItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>No hay empleados disponibles</Text>
                  <Text style={styles.emptySubtext}>
                    Agrega empleados primero para poder agendar reuniones
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: hp("5%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("90%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginLeft: wp("2%"),
    color: "#25272B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp("10%"),
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    width: wp("90%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: wp("5%"),
    marginVertical: hp("1%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: hp("2.5%"),
  },
  sectionTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp("1%"),
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.8%"),
    backgroundColor: "#F9F9F9",
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: wp("4%"),
    marginLeft: wp("2%"),
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: {
    fontSize: wp("4%"),
    color: "#333",
    marginLeft: wp("2%"),
  },
  calendarContainer: {
    marginTop: hp("1.5%"),
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  miniAvatar: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    backgroundColor: "#009245",
    justifyContent: "center",
    alignItems: "center",
  },
  miniAvatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: wp("3.5%"),
  },
  inputGroup: {
    marginBottom: hp("1.5%"),
  },
  inputLabel: {
    fontSize: wp("4%"),
    color: "#333",
    marginBottom: hp("0.5%"),
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    fontSize: wp("4%"),
    backgroundColor: "#F9F9F9",
  },
  textArea: {
    height: hp("12%"),
    textAlignVertical: "top",
    paddingTop: hp("1.5%"),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  buttonCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 25,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("2%"),
  },
  buttonCancelText: {
    color: "#FF3B30",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  buttonSave: {
    flex: 1.5,
    backgroundColor: "#009245",
    borderRadius: 25,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wp("2%"),
  },
  buttonSaveText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "500",
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
    maxHeight: hp("70%"),
    padding: wp("5%"),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
    paddingBottom: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  listContent: {
    paddingBottom: hp("2%"),
  },
  empleadoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
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
  empleadoInfo: {
    flex: 1,
  },
  empleadoNombre: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#333",
  },
  empleadoCargo: {
    fontSize: wp("3.8%"),
    color: "#666",
    marginTop: hp("0.5%"),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("5%"),
  },
  emptyText: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#666",
    marginTop: hp("2%"),
  },
  emptySubtext: {
    fontSize: wp("3.8%"),
    color: "#999",
    textAlign: "center",
    marginTop: hp("1%"),
    paddingHorizontal: wp("5%"),
  },
  // Estilos para el selector de tiempo personalizado
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  timePickerColumn: {
    width: wp("30%"),
    alignItems: "center",
  },
  timePickerLabel: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginBottom: hp("1%"),
  },
  timePickerScroll: {
    height: hp("20%"),
  },
  timePickerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("1%"),
    width: wp("20%"),
    borderRadius: 8,
  },
  timePickerItemSelected: {
    backgroundColor: "#009245",
  },
  timePickerItemText: {
    fontSize: wp("5%"),
    color: "#333",
  },
  timePickerItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timeSeparator: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginHorizontal: wp("2%"),
  },
  timeConfirmButton: {
    backgroundColor: "#009245",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: 25,
    alignSelf: "center",
    marginTop: hp("1%"),
  },
  timeConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
});