import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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

export default function EditPublication() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Obtener los datos de la publicación a editar desde los parámetros de navegación
  const publicationParam = route.params?.publication;
  
  const [loading, setLoading] = useState(false);
  const [loadingPublication, setLoadingPublication] = useState(true);
  const [image, setImage] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Estado para los campos del formulario
  const [publicationId, setPublicationId] = useState("");
  const [tipoPropiedad, setTipoPropiedad] = useState("Casa");
  const [operacion, setOperacion] = useState("Arriendo y Venta");
  const [estado, setEstado] = useState("Nuevo");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [imagenUrl, setImagenUrl] = useState(null);
  
  // Estados para el mapa
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Comprobar permisos de la cámara/galería
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== "granted") {
        Alert.alert(
          "Permisos insuficientes",
          "Necesitamos permisos para acceder a tu galería de fotos."
        );
      }
      
      // Solicitar permisos de ubicación
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          });
        } catch (error) {
          console.error("Error al obtener ubicación:", error);
          // Ubicación por defecto (centrada en Santiago de Chile)
          setCurrentLocation({
            latitude: -33.447487,
            longitude: -70.673676,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          });
        }
      } else {
        // Ubicación por defecto si no hay permisos
        setCurrentLocation({
          latitude: -33.447487,
          longitude: -70.673676,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        });
      }
    })();
    
    // Cargar información del usuario
    getUserData();
    
    // Cargar datos de la publicación si existe
    if (publicationParam) {
      loadPublicationData(publicationParam);
    } else {
      setLoadingPublication(false);
      Alert.alert("Error", "No se encontró la publicación a editar", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  }, []);
  
  const loadPublicationData = (publication) => {
    try {
      // Extraer el ID de la publicación
      setPublicationId(publication.id);
      
      // Cargar todos los datos en el formulario
      setTipoPropiedad(publication.tipoPropiedad || "Casa");
      setOperacion(publication.operacion || "Arriendo y Venta");
      setEstado(publication.estado || "Nuevo");
      setDireccion(publication.direccion || "");
      setDescripcion(publication.descripcion || "");
      setPrecioMin(publication.precioMin ? publication.precioMin.toString() : "");
      setPrecioMax(publication.precioMax ? publication.precioMax.toString() : "");
      
      // Cargar la imagen existente si hay
      if (publication.imagenUrl) {
        setImagenUrl(publication.imagenUrl);
      }
      
      // Cargar ubicación si existe
      if (publication.ubicacion) {
        setLocation(publication.ubicacion);
      }
      
      setLoadingPublication(false);
    } catch (error) {
      console.error("Error al cargar datos de la publicación:", error);
      setLoadingPublication(false);
      Alert.alert("Error", "No se pudieron cargar los datos de la publicación");
    }
  };
  
  const getUserData = async () => {
    try {
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
      const collections = ["users", "inmobiliaria", "corredor", "agenciacorretaje"];
      
      for (const collectionName of collections) {
        const userDoc = await getDoc(doc(db, collectionName, uid));
        
        if (userDoc.exists()) {
          setUserData({
            ...userDoc.data(),
            id: userDoc.id,
            collection: collectionName
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };
  
  const uploadImage = async () => {
    if (!image || !imageChanged) return imagenUrl; // Mantener la URL existente si no se cambió
    
    try {
      setUploading(true);
      
      // Convertir URI a Blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      // Subir a Firebase Storage
      const storage = getStorage();
      const auth = getAuth();
      const user = auth.currentUser;
      
      const filename = `publicaciones/${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progreso de subida (opcional)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% complete`);
          },
          (error) => {
            console.error("Error al subir imagen:", error);
            setUploading(false);
            reject(error);
          },
          async () => {
            // Subida completada
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      setUploading(false);
      return imagenUrl; // Mantener la URL anterior en caso de error
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
    
    // Obtener dirección reversa (opcional)
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
    }
  };
  
  const confirmLocation = () => {
    if (!location) {
      Alert.alert("Advertencia", "Por favor, selecciona una ubicación en el mapa");
      return;
    }
    
    closeMap();
  };
  
  const actualizarPublicacion = async () => {
    // Validación básica
    if (!direccion || !descripcion) {
      Alert.alert("Error", "Por favor, complete al menos la dirección y descripción");
      return;
    }
    
    // Validar precios si están presentes
    if (precioMax && precioMin && Number(precioMax) < Number(precioMin)) {
      Alert.alert("Error", "El precio máximo debe ser mayor que el precio mínimo");
      return;
    }
    
    try {
      setLoading(true);
      
      // Procesar imagen si cambió
      let finalImageUrl = imagenUrl;
      if (imageChanged) {
        finalImageUrl = await uploadImage();
      }
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "No hay usuario autenticado");
        setLoading(false);
        return;
      }
      
      const db = getFirestore();
      
      // Datos actualizados de la publicación
      const publicacionData = {
        tipoPropiedad,
        operacion,
        estado,
        direccion,
        descripcion,
        precioMin: precioMin ? Number(precioMin) : 0,
        precioMax: precioMax ? Number(precioMax) : 0,
        imagenUrl: finalImageUrl,
        updatedAt: serverTimestamp()
      };
      
      // Agregar coordenadas si están disponibles
      if (location) {
        publicacionData.ubicacion = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
      
      // Actualizar en Firestore
      const publicacionRef = doc(db, "publicaciones", publicationId);
      await updateDoc(publicacionRef, publicacionData);
      
      Alert.alert(
        "Éxito",
        "Publicación actualizada correctamente",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("MyPublications")
          }
        ]
      );
    } catch (error) {
      console.error("Error al actualizar publicación:", error);
      Alert.alert("Error", "No se pudo actualizar la publicación: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
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

  if (loadingPublication) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009245" />
          <Text style={styles.loadingText}>Cargando datos de la publicación...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Editar publicación</Text>
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
              {(image || imagenUrl) ? (
                <Image source={{ uri: image || imagenUrl }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#AAAAAA" />
                  <Text style={styles.imagePlaceholderText}>Agregar fotografía</Text>
                </View>
              )}
              <View style={styles.editImageOverlay}>
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
                <Text style={styles.editImageText}>Editar</Text>
              </View>
            </TouchableOpacity>
            
            {/* Tipo de propiedad */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Tipo de propiedad</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="Casa"
                  selected={tipoPropiedad === "Casa"}
                  onPress={() => setTipoPropiedad("Casa")}
                />
                <OptionButton
                  title="Departamento"
                  selected={tipoPropiedad === "Departamento"}
                  onPress={() => setTipoPropiedad("Departamento")}
                />
              </View>
            </View>
            
            {/* Propiedad en */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Propiedad en</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="Arriendo y Venta"
                  selected={operacion === "Arriendo y Venta"}
                  onPress={() => setOperacion("Arriendo y Venta")}
                />
                <OptionButton
                  title="Arriendo"
                  selected={operacion === "Arriendo"}
                  onPress={() => setOperacion("Arriendo")}
                />
                <OptionButton
                  title="Venta"
                  selected={operacion === "Venta"}
                  onPress={() => setOperacion("Venta")}
                />
              </View>
            </View>
            
            {/* Estado propiedad */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Estado propiedad</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="Nuevo"
                  selected={estado === "Nuevo"}
                  onPress={() => setEstado("Nuevo")}
                />
                <OptionButton
                  title="Usado"
                  selected={estado === "Usado"}
                  onPress={() => setEstado("Usado")}
                />
              </View>
            </View>
            
            {/* Dirección con mapa */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Dirección</Text>
              <View style={styles.locationContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingrese dirección"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>
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
                placeholder="Ingrese descripción de la propiedad"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Precio */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Precio</Text>
              <View style={styles.priceContainer}>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Min."
                    value={precioMin}
                    onChangeText={setPrecioMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Max."
                    value={precioMax}
                    onChangeText={setPrecioMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={actualizarPublicacion}
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
                Toca en el mapa para seleccionar la ubicación exacta de la propiedad
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    position: "relative",
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
  editImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("0.8%"),
  },
  editImageText: {
    color: "#FFFFFF",
    marginLeft: wp("1%"),
    fontSize: wp("3.5%"),
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: wp("4%"),
    height: hp("6%"),
    flex: 1,
  },
  inputIcon: {
    marginRight: wp("2%"),
  },
  input: {
    flex: 1,
    height: hp("6%"),
    fontSize: wp("4%"),
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
    justifyContent: "space-between",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: wp("4%"),
    width: "48%",
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
  cancelButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 50,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
  },
  cancelButtonText: {
    color: "#FF3B30",
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