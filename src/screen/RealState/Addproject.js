import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function AddProject() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Nuevo estado para el progreso de carga
  const [userData, setUserData] = useState(null);
  const [searching, setSearching] = useState(false); // Nuevo estado para controlar la búsqueda de dirección
  
  // Estado para los campos del formulario
  const [tipoProyecto, setTipoProyecto] = useState("Residencial");
  const [estadoProyecto, setEstadoProyecto] = useState("En Plano");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioDesde, setPrecioDesde] = useState("");
  const [cantidadUnidades, setCantidadUnidades] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  
  // Estados para el mapa
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  
  useEffect(() => {
    let isMounted = true; // Para evitar actualizar estado si el componente se desmonta
    
    const initialize = async () => {
      // Comprobar permisos de la cámara/galería
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== "granted" && isMounted) {
        Alert.alert(
          "Permisos insuficientes",
          "Necesitamos permisos para acceder a tu galería de fotos."
        );
      }
      
      // Solicitar permisos de ubicación
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === "granted" && isMounted) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced, // Cambiado de Highest a Balanced para mejor rendimiento
          });
          
          if (isMounted) {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            });
          }
        } catch (error) {
          console.error("Error al obtener ubicación:", error);
          // Ubicación por defecto (centrada en Concepción, Chile en lugar de Santiago)
          if (isMounted) {
            setCurrentLocation({
              latitude: -36.8270679, // Coordenadas de Concepción, Chile
              longitude: -73.0501689,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            });
          }
        }
      } else {
        // Ubicación por defecto si no hay permisos
        if (isMounted) {
          setCurrentLocation({
            latitude: -36.8270679, // Concepción, Chile
            longitude: -73.0501689,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          });
        }
        
        // Mostrar mensaje para explicar por qué es importante la ubicación
        if (isMounted && locationStatus !== "granted") {
          Alert.alert(
            "Permisos de ubicación",
            "Sin permisos de ubicación, no podrás ver tu posición actual en el mapa. Aún podrás seleccionar ubicaciones manualmente.",
            [
              { text: "Entendido" }
            ]
          );
        }
      }
    };
    
    initialize();
    getUserData();
    
    // Función de limpieza
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Nueva función para buscar dirección
  const buscarDireccion = async () => {
    if (!direccion.trim()) {
      Alert.alert("Error", "Por favor, ingrese una dirección para buscar");
      return;
    }
    
    try {
      setSearching(true);
      
      // Usar la API de geocodificación de Expo Location
      const geocodedLocation = await Location.geocodeAsync(direccion);
      
      if (geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];
        
        // Actualizar la ubicación seleccionada
        const newLocation = { latitude, longitude };
        setLocation(newLocation);
        
        // Abrir automáticamente el mapa
        setMapVisible(true);
        
        // Si el mapa está visible y la referencia existe, centrar en la ubicación
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }, 1000); // Animación de 1 segundo
          }
        }, 500); // Pequeño retraso para asegurar que el mapa esté completamente cargado
        
        // Obtener dirección reversa para mostrar la dirección completa
        reverseGeocode({ latitude, longitude });
      } else {
        Alert.alert(
          "Ubicación no encontrada", 
          "No se pudo encontrar la ubicación. Intente con una dirección más específica o seleccione manualmente en el mapa."
        );
      }
    } catch (error) {
      console.error("Error al geocodificar dirección:", error);
      Alert.alert(
        "Error", 
        "Hubo un problema al buscar la dirección. Intente nuevamente o seleccione la ubicación manualmente."
      );
    } finally {
      setSearching(false);
    }
  };
  
  const getUserData = async () => {
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
      
      // Buscar en qué colección está el usuario
      const collections = ["agenciacorretaje"];
      let userFound = false;
      
      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName),
          where("uid", "==", uid)
        );
        
        const snapshot = await getDocs(userQuery);
        
        if (!snapshot.empty) {
          setUserData({
            ...snapshot.docs[0].data(),
            id: snapshot.docs[0].id,
            collection: collectionName
          });
          userFound = true;
          break;
        }
      }
      
      if (!userFound) {
        console.warn("No se encontró el usuario en ninguna colección");
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del usuario: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reducido para mejor rendimiento (de 0.8 a 0.7)
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen: " + error.message);
    }
  };
  
  const uploadImage = async () => {
    if (!image) return null;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Convertir URI a Blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      // Subir a Firebase Storage
      const storage = getStorage();
      const auth = getAuth();
      const user = auth.currentUser;
      
      const filename = `proyectos/${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Actualizar progreso de subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log(`Upload is ${progress}% complete`);
          },
          (error) => {
            console.error("Error al subir imagen:", error);
            setUploading(false);
            setUploadProgress(0);
            reject(error);
          },
          async () => {
            // Subida completada
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            setUploadProgress(0);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      setUploading(false);
      setUploadProgress(0);
      Alert.alert("Error", "No se pudo subir la imagen: " + error.message);
      return null;
    }
  };
  
  const openMap = () => {
    setMapVisible(true);
  };
  
  const closeMap = () => {
    setMapVisible(false);
  };
  
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setLocation(coordinate);
    
    // Obtener dirección reversa
    reverseGeocode(coordinate);
  };
  
  const reverseGeocode = async (coordinate) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      
      if (result.length > 0) {
        const address = result[0];
        const addressText = [
          address.street,
          address.streetNumber,
          address.district,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(", ");
        
        setDireccion(addressText);
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      // No cambiar la dirección si hay error, dejar que el usuario la ingrese manualmente
      Alert.alert(
        "Error", 
        "No se pudo obtener la dirección para esta ubicación. Puede ingresarla manualmente."
      );
    }
  };
  
  const confirmLocation = () => {
    if (!location) {
      Alert.alert(
        "Ubicación no seleccionada", 
        "Por favor, selecciona una ubicación en el mapa tocando en el punto deseado."
      );
      return;
    }
    
    Alert.alert(
      "Ubicación confirmada",
      "La ubicación ha sido seleccionada correctamente.",
      [
        {
          text: "OK",
          onPress: closeMap
        }
      ]
    );
  };
  
  // Función mejorada para formatear precios con separador de miles
  const formatearPrecio = (precio) => {
    if (!precio) return "";
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Función inversa para quitar el formato al guardar
  const desformatearPrecio = (precioFormateado) => {
    if (!precioFormateado) return "";
    return precioFormateado.replace(/\./g, "");
  };
  
  // Función para crear un calendario personalizado en un modal
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);
  
  const openDatePicker = () => {
    // Reiniciar a valores actuales al abrir
    const currentDate = new Date();
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedDay(null);
    setDatePickerVisible(true);
  };
  
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month, year) => {
    // Obtiene el día de la semana (0-6) del primer día del mes
    return new Date(year, month - 1, 1).getDay();
  };
  
  const getMonthName = (month) => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthNames[month - 1];
  };
  
  const handleSelectDate = () => {
    if (!selectedDay) return;
    
    const formattedDate = `${String(selectedDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
    setFechaEntrega(formattedDate);
    setDatePickerVisible(false);
  };
  
  const guardarProyecto = async () => {
    // Validación básica
    if (!nombreProyecto || !direccion || !descripcion) {
      Alert.alert("Error", "Por favor, complete al menos el nombre, dirección y descripción del proyecto");
      return;
    }
    
    // Confirmar si no se ha seleccionado ubicación
    if (!location) {
      Alert.alert(
        "Ubicación no especificada",
        "No has seleccionado una ubicación en el mapa. ¿Deseas continuar sin especificar ubicación?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Continuar sin ubicación",
            onPress: () => procesarGuardado()
          }
        ]
      );
    } else {
      procesarGuardado();
    }
  };
  
  const procesarGuardado = async () => {
    try {
      setLoading(true);
      
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          Alert.alert(
            "Advertencia", 
            "No se pudo subir la imagen, pero puedes continuar con el proyecto sin imagen."
          );
        }
      }
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "No hay usuario autenticado");
        setLoading(false);
        navigation.navigate("Signin");
        return;
      }
      
      const db = getFirestore();
      
      // Procesar precios sin formato
      const precioDesdeProcessed = precioDesde ? Number(desformatearPrecio(precioDesde)) : 0;
      
      // Datos del proyecto
      const proyectoData = {
        tipoProyecto,
        estadoProyecto,
        nombreProyecto,
        direccion,
        descripcion,
        precioDesde: precioDesdeProcessed,
        cantidadUnidades: cantidadUnidades ? Number(cantidadUnidades) : 0,
        fechaEntrega,
        imagenUrl: imageUrl,
        userId: user.uid,
        userCollection: userData?.collection || "unknown", // Añadido para saber la colección del usuario
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Agregar coordenadas si están disponibles
      if (location) {
        proyectoData.ubicacion = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
      
      // Guardar en Firestore
      await addDoc(collection(db, "proyectos"), proyectoData);
      
      Alert.alert(
        "Éxito",
        "Proyecto creado correctamente",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("HomeRealstate")
          }
        ]
      );
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      Alert.alert("Error", "No se pudo guardar el proyecto: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Componente para botones de opciones
  const OptionButton = ({ title, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected ? styles.selectedOption : styles.unselectedOption
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected ? styles.selectedText : styles.unselectedText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Nuevo Proyecto Inmobiliario</Text>
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Sección de imagen */}
            <TouchableOpacity
              style={styles.imageSelector}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#AAAAAA" />
                  <Text style={styles.imagePlaceholderText}>Agregar fotografía del proyecto</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Indicador de progreso de carga */}
            {uploading && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
              </View>
            )}
            
            {/* Nombre del proyecto */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Nombre del proyecto</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese nombre del proyecto"
                  value={nombreProyecto}
                  onChangeText={setNombreProyecto}
                />
              </View>
            </View>
            
            {/* Tipo de proyecto */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Tipo de proyecto</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="Residencial"
                  selected={tipoProyecto === "Residencial"}
                  onPress={() => setTipoProyecto("Residencial")}
                />
                <OptionButton
                  title="Comercial"
                  selected={tipoProyecto === "Comercial"}
                  onPress={() => setTipoProyecto("Comercial")}
                />
                <OptionButton
                  title="Mixto"
                  selected={tipoProyecto === "Mixto"}
                  onPress={() => setTipoProyecto("Mixto")}
                />
              </View>
            </View>
            
            {/* Estado del proyecto */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Estado del proyecto</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="En Plano"
                  selected={estadoProyecto === "En Plano"}
                  onPress={() => setEstadoProyecto("En Plano")}
                />
                <OptionButton
                  title="En Construcción"
                  selected={estadoProyecto === "En Construcción"}
                  onPress={() => setEstadoProyecto("En Construcción")}
                />
                <OptionButton
                  title="Terminado"
                  selected={estadoProyecto === "Terminado"}
                  onPress={() => setEstadoProyecto("Terminado")}
                />
              </View>
            </View>
            
            {/* Dirección con mapa y botón de búsqueda */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Dirección</Text>
              <View style={styles.locationContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingrese dirección del proyecto"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>
                
                {/* Botón de búsqueda */}
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={buscarDireccion}
                  disabled={!direccion.trim() || searching}
                >
                  {searching ? (
                    <ActivityIndicator color="#009245" size="small" />
                  ) : (
                    <Ionicons name="search-outline" size={22} color="#009245" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={openMap}
                >
                  <Ionicons name="map-outline" size={22} color="#009245" />
                </TouchableOpacity>
              </View>
              
              {/* Vista previa del mapa si hay ubicación seleccionada */}
              {location && (
                <TouchableOpacity 
                  style={styles.mapPreview}
                  onPress={openMap}
                >
                  <MapView
                    style={styles.mapPreviewContent}
                    region={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                  >
                    <Marker coordinate={location} />
                  </MapView>
                  <View style={styles.mapPreviewOverlay}>
                    <Text style={styles.mapPreviewText}>Toca para editar ubicación</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Descripción */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ingrese descripción del proyecto inmobiliario"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Precio desde */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Precio desde</Text>
              <View style={styles.priceContainer}>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Precio desde"
                    value={precioDesde}
                    onChangeText={(text) => setPrecioDesde(formatearPrecio(desformatearPrecio(text)))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            {/* Cantidad de unidades */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Cantidad de unidades</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Número de unidades disponibles"
                  value={cantidadUnidades}
                  onChangeText={setCantidadUnidades}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {/* Fecha estimada de entrega */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Fecha estimada de entrega</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openDatePicker}
              >
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <Text style={[styles.input, !fechaEntrega && { color: '#999' }]}>
                    {fechaEntrega || "Seleccionar mes/año de entrega"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={18} color="#666666" />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>Editar fotografías</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={guardarProyecto}
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar proyecto</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Modal del mapa */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeMap}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              style={styles.mapCloseButton}
              onPress={closeMap}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Seleccionar Ubicación</Text>
            <TouchableOpacity
              style={styles.mapConfirmButton}
              onPress={confirmLocation}
            >
              <Text style={styles.mapConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            {currentLocation && (
              <MapView
                ref={mapRef}
                style={styles.mapView}
                initialRegion={currentLocation}
                onPress={handleMapPress}
              >
                {location && <Marker coordinate={location} />}
              </MapView>
            )}
            
            <View style={styles.mapInstructions}>
              <Text style={styles.mapInstructionsText}>
                Toca en el mapa para seleccionar la ubicación exacta del proyecto
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={async () => {
                try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== "granted") {
                    Alert.alert("Permiso denegado", "No podemos acceder a tu ubicación");
                    return;
                  }
                  
                  const location = await Location.getCurrentPositionAsync({});
                  const currentLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                  };
                  
                  mapRef.current.animateToRegion(currentLocation);
                } catch (error) {
                  console.error("Error al obtener ubicación actual:", error);
                  Alert.alert("Error", "No se pudo obtener tu ubicación actual");
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Modal personalizado para seleccionar fecha */}
      <Modal
        visible={datePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.datePickerModalOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.datePickerModalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.datePickerContent}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Seleccionar Fecha</Text>
                <TouchableOpacity 
                  style={styles.datePickerCloseButton}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.currentSelectionContainer}>
                <Text style={styles.currentSelectionText}>
                  {selectedMonth && selectedYear 
                    ? `${getMonthName(selectedMonth)} ${selectedYear}` 
                    : "Seleccione fecha"}
                </Text>
                {selectedDay && (
                  <Text style={styles.selectedDayText}>{selectedDay}</Text>
                )}
              </View>
              
              <View style={styles.monthYearSelector}>
                <TouchableOpacity
                  style={styles.monthControlButton}
                  onPress={() => {
                    let newMonth = selectedMonth - 1;
                    let newYear = selectedYear;
                    if (newMonth < 1) {
                      newMonth = 12;
                      newYear -= 1;
                    }
                    setSelectedMonth(newMonth);
                    setSelectedYear(newYear);
                    setSelectedDay(null);
                  }}
                >
                  <Ionicons name="chevron-back" size={24} color="#009245" />
                </TouchableOpacity>
                
                <View style={styles.yearMonthDisplay}>
                  <Text style={styles.monthYearText}>{getMonthName(selectedMonth)}</Text>
                  <Text style={styles.yearText}>{selectedYear}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.monthControlButton}
                  onPress={() => {
                    let newMonth = selectedMonth + 1;
                    let newYear = selectedYear;
                    if (newMonth > 12) {
                      newMonth = 1;
                      newYear += 1;
                    }
                    setSelectedMonth(newMonth);
                    setSelectedYear(newYear);
                    setSelectedDay(null);
                  }}
                >
                  <Ionicons name="chevron-forward" size={24} color="#009245" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarContainer}>
                {/* Días de la semana */}
                <View style={styles.weekdaysHeader}>
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <Text key={day} style={styles.weekdayText}>{day}</Text>
                  ))}
                </View>
                
                {/* Días del mes */}
                <View style={styles.daysGrid}>
                  {/* Espacios en blanco para alinear los días */}
                  {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <View key={`empty-${i}`} style={styles.emptyDay} />
                  ))}
                  
                  {/* Días del mes */}
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1).map((day) => {
                    const isToday = day === new Date().getDate() && 
                                  selectedMonth === new Date().getMonth() + 1 && 
                                  selectedYear === new Date().getFullYear();
                    
                    const isSelected = day === selectedDay;
                    
                    return (
                      <TouchableOpacity 
                        key={`day-${day}`}
                        style={[
                          styles.dayItem,
                          isToday && styles.todayItem,
                          isSelected && styles.selectedItem
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedItemText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !selectedDay && styles.disabledButton
                  ]}
                  onPress={handleSelectDate}
                  disabled={!selectedDay}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    marginLeft: wp("3%"),
    color: "#333333",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp("3%"),
  },
  formContainer: {
    padding: wp("5%"),
  },
  imageSelector: {
    width: "100%",
    height: hp("20%"),
    borderRadius: 10,
    marginBottom: hp("2%"),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  imagePlaceholderText: {
    color: "#888888",
    marginTop: 8,
    fontSize: wp("3.5%"),
  },
  // Nuevos estilos para el indicador de progreso
  progressContainer: {
    height: hp("2%"),
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginBottom: hp("2%"),
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#009245",
    borderRadius: 10,
  },
  progressText: {
    position: "absolute",
    right: 5,
    top: 0,
    bottom: 0,
    textAlignVertical: "center",
    fontSize: wp("3%"),
    color: "#333",
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: hp("2%"),
  },
  sectionTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333333",
    marginBottom: hp("1%"),
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContainer: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  datePickerTitle: {
    fontSize: wp("5%"),
    fontWeight: '600',
    color: '#333333',
  },
  datePickerCloseButton: {
    padding: 5,
  },
  currentSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
  },
  currentSelectionText: {
    fontSize: wp("4%"),
    color: '#555',
    fontWeight: '500',
  },
  selectedDayText: {
    fontSize: wp("5%"),
    fontWeight: 'bold',
    color: '#009245',
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthControlButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearMonthDisplay: {
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: wp("4.5%"),
    fontWeight: '600',
    color: '#333',
  },
  yearText: {
    fontSize: wp("3.5%"),
    color: '#666',
    marginTop: 2,
  },
  calendarContainer: {
    marginBottom: 15,
  },
  weekdaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  weekdayText: {
    fontSize: wp("3.2%"),
    fontWeight: '500',
    color: '#555',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayItem: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    margin: 1,
  },
  dayText: {
    fontSize: wp("3.8%"),
    color: '#333',
  },
  todayItem: {
    backgroundColor: '#E6F7EF',
    borderWidth: 1,
    borderColor: '#009245',
  },
  todayText: {
    color: '#009245',
    fontWeight: '500',
  },
  selectedItem: {
    backgroundColor: '#009245',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#009245',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#AAA',
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  datePickerTitle: {
    fontSize: wp("5%"),
    fontWeight: '600',
    color: '#333333',
  },
  datePickerCloseButton: {
    padding: 5,
  },
  datePickerBody: {
    flexDirection: 'column',
  },
  datePickerLabel: {
    fontSize: wp("4%"),
    fontWeight: '500',
    marginBottom: 10,
    color: '#333333',
  },
  yearSelector: {
    marginBottom: 20,
  },
  yearScrollView: {
    height: 150,
  },
  yearItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  yearText: {
    fontSize: wp("4.5%"),
    textAlign: 'center',
  },
  monthSelector: {
    marginBottom: 10,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  monthText: {
    fontSize: wp("3.8%"),
  },
  datePickerButton: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: wp("4%"),
    height: hp("6%"),
    flex: 1, // Agregado para que coincida con Addpublication.js
  },
  inputIcon: {
    marginRight: wp("2%"),
  },
  input: {
    flex: 1,
    height: hp("6%"),
    fontSize: wp("4%"),
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  optionButton: {
    borderRadius: 50,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("5%"),
    marginRight: wp("2%"),
    marginBottom: hp("1%"),
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: "#009245",
    borderColor: "#009245",
  },
  unselectedOption: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCCCCC",
  },
  optionText: {
    fontSize: wp("3.8%"),
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  unselectedText: {
    color: "#666666",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Nuevo estilo para el botón de búsqueda
  searchButton: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: hp("3%"),
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("2%"),
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  mapButton: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: hp("3%"),
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("2%"),
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  mapPreview: {
    width: "100%",
    height: hp("15%"),
    borderRadius: 10,
    marginTop: hp("1%"),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  mapPreviewContent: {
    width: "100%",
    height: "100%",
  },
  mapPreviewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: hp("0.8%"),
  },
  mapPreviewText: {
    color: "#FFFFFF",
    fontSize: wp("3.5%"),
    textAlign: "center",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 15,
    padding: wp("4%"),
    fontSize: wp("4%"),
    minHeight: hp("12%"),
  },
  priceContainer: {
    flexDirection: "row",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: wp("4%"),
    width: "100%",
    height: hp("6%"),
  },
  currencySymbol: {
    fontSize: wp("4.5%"),
    color: "#666666",
    marginRight: wp("1%"),
  },
  priceTextInput: {
    flex: 1,
    height: hp("6%"),
    fontSize: wp("4%"),
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("3%"),
  },
  photoButton: {
    borderWidth: 1,
    borderColor: "#009245",
    borderRadius: 50,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
  },
  photoButtonText: {
    color: "#009245",
    fontSize: wp("3.8%"),
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#009245",
    borderRadius: 50,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: wp("3.8%"),
    fontWeight: "500",
  },
  // Estilos para el modal del mapa
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mapCloseButton: {
    padding: 5,
  },
  mapModalTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
  },
  mapConfirmButton: {
    padding: 5,
  },
  mapConfirmText: {
    color: "#009245",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapView: {
    width: "100%",
    height: "100%",
  },
  mapInstructions: {
    position: "absolute",
    top: hp("2%"),
    left: wp("5%"),
    right: wp("5%"),
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    padding: hp("1.5%"),
  },
  mapInstructionsText: {
    color: "#FFFFFF",
    fontSize: wp("3.8%"),
    textAlign: "center",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: hp("3%"),
    right: wp("5%"),
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#009245",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});