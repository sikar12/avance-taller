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
  Dimensions,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
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

export default function AddPublication() {
  const navigation = useNavigation();
  const route = useRoute();
  const source = route.params?.source || "agencybrokage"; // Identificar el origen
  
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Nuevo estado para el progreso de carga
  const [userData, setUserData] = useState(null);
  const [searching, setSearching] = useState(false); // Nuevo estado para controlar la búsqueda de dirección
  
  // Estado para los campos del formulario
  const [tipoPropiedad, setTipoPropiedad] = useState("Casa");
  const [operacion, setOperacion] = useState("Arriendo y Venta");
  const [estado, setEstado] = useState("Nuevo");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  
  // Nuevos estados para baños, habitaciones y tipo de cocina
  const [cantidadBanos, setCantidadBanos] = useState(1);
  const [cantidadHabitaciones, setCantidadHabitaciones] = useState(1);
  const [cantidadPisos, setCantidadPisos] = useState(1);
  const [tipoCocina, setTipoCocina] = useState("Americana"); // Valores posibles: Americana, Integrada, Cerrada
  
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
      const collections = ["users", "inmobiliaria", "corredor", "agenciacorretaje"];
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
        quality: 0.7, // Reducido para mejor rendimiento
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
      
      const filename = `publicaciones/${user.uid}/${Date.now()}.jpg`;
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
  
  const guardarPublicacion = async () => {
    // Validación mejorada
    const camposRequeridos = [
      { campo: direccion, nombre: "dirección" },
      { campo: descripcion, nombre: "descripción" }
    ];
    
    const camposFaltantes = camposRequeridos
      .filter(item => !item.campo.trim())
      .map(item => item.nombre);
    
    if (camposFaltantes.length > 0) {
      Alert.alert(
        "Campos requeridos", 
        `Por favor, complete los siguientes campos: ${camposFaltantes.join(", ")}.`
      );
      return;
    }
    
    // Validar valores numéricos para baños y habitaciones
    if (cantidadBanos < 1 || cantidadBanos > 10) {
      Alert.alert("Error", "La cantidad de baños debe estar entre 1 y 10");
      return;
    }
    
    if (cantidadHabitaciones < 1 || cantidadHabitaciones > 20) {
      Alert.alert("Error", "La cantidad de habitaciones debe estar entre 1 y 20");
      return;
    }
    
    if (cantidadPisos < 1 || cantidadPisos > 50) {
      Alert.alert("Error", "La cantidad de pisos debe estar entre 1 y 50");
      return;
    }
    
    // Validar precios si están presentes
    if (precioMin && precioMax) {
      const minNumber = Number(desformatearPrecio(precioMin));
      const maxNumber = Number(desformatearPrecio(precioMax));
      
      if (maxNumber < minNumber) {
        Alert.alert("Error", "El precio máximo debe ser mayor que el precio mínimo");
        return;
      }
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
            "No se pudo subir la imagen, pero puedes continuar con la publicación sin imagen."
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
      const precioMinProcessed = precioMin ? Number(desformatearPrecio(precioMin)) : 0;
      const precioMaxProcessed = precioMax ? Number(desformatearPrecio(precioMax)) : 0;
      
      // Datos de la publicación con source añadido
      const publicacionData = {
        tipoPropiedad,
        operacion,
        estado,
        direccion,
        descripcion,
        precioMin: precioMinProcessed,
        precioMax: precioMaxProcessed,
        cantidadBanos,
        cantidadHabitaciones,
        cantidadPisos,
        tipoCocina,
        imagenUrl: imageUrl,
        userId: user.uid,
        userCollection: userData?.collection || "unknown", // Añadido para saber la colección del usuario
        source: source,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Agregar coordenadas si están disponibles
      if (location) {
        publicacionData.ubicacion = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
      
      // Guardar en Firestore
      await addDoc(collection(db, "publicaciones"), publicacionData);
      
      Alert.alert(
        "Éxito",
        "Publicación creada correctamente",
        [
          {
            text: "OK",
            onPress: () => {
              if (source === "realstate") {
                navigation.navigate("HomeRealstate");
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error al guardar publicación:", error);
      Alert.alert("Error", "No se pudo guardar la publicación: " + error.message);
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

  // Componente para selector numérico
  const NumericSelector = ({ title, value, setValue, minValue = 1, maxValue = 10 }) => {
    const handleDecrease = () => {
      if (value > minValue) {
        setValue(value - 1);
      }
    };

    const handleIncrease = () => {
      if (value < maxValue) {
        setValue(value + 1);
      }
    };

    return (
      <View style={styles.numericSelectorContainer}>
        <Text style={styles.numericSelectorTitle}>{title}</Text>
        <View style={styles.numericSelectorControls}>
          <TouchableOpacity 
            style={styles.numericButton}
            onPress={handleDecrease}
            disabled={value <= minValue}
          >
            <Ionicons 
              name="remove" 
              size={24} 
              color={value <= minValue ? "#CCCCCC" : "#009245"} 
            />
          </TouchableOpacity>
          
          <Text style={styles.numericValue}>{value}</Text>
          
          <TouchableOpacity 
            style={styles.numericButton}
            onPress={handleIncrease}
            disabled={value >= maxValue}
          >
            <Ionicons 
              name="add" 
              size={24} 
              color={value >= maxValue ? "#CCCCCC" : "#009245"} 
            />
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Crear Publicación</Text>
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
                  <Text style={styles.imagePlaceholderText}>Agregar fotografía</Text>
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
            
            {/* Cantidad de baños y habitaciones */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Detalles de la propiedad</Text>
              <View style={styles.detailsContainer}>
                <NumericSelector
                  title="Baños"
                  value={cantidadBanos}
                  setValue={setCantidadBanos}
                  minValue={1}
                  maxValue={10}
                />
                <NumericSelector
                  title="Habitaciones"
                  value={cantidadHabitaciones}
                  setValue={setCantidadHabitaciones}
                  minValue={1}
                  maxValue={20}
                />
                <NumericSelector
                  title="Pisos"
                  value={cantidadPisos}
                  setValue={setCantidadPisos}
                  minValue={1}
                  maxValue={50}
                />
              </View>
            </View>
            
            {/* Tipo de cocina */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Tipo de cocina</Text>
              <View style={styles.optionsContainer}>
                <OptionButton
                  title="Americana"
                  selected={tipoCocina === "Americana"}
                  onPress={() => setTipoCocina("Americana")}
                />
                <OptionButton
                  title="Integrada"
                  selected={tipoCocina === "Integrada"}
                  onPress={() => setTipoCocina("Integrada")}
                />
                <OptionButton
                  title="Cerrada"
                  selected={tipoCocina === "Cerrada"}
                  onPress={() => setTipoCocina("Cerrada")}
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
                    placeholder="Ingrese dirección"
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
                
                {/* Botón de mapa */}
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
                    onChangeText={(text) => setPrecioMin(formatearPrecio(desformatearPrecio(text)))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="Max."
                    value={precioMax}
                    onChangeText={(text) => setPrecioMax(formatearPrecio(desformatearPrecio(text)))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>Editar fotografías</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={guardarPublicacion}
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Aplicar cambios</Text>
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
  // Estilos para los nuevos selectores numéricos
  numericSelectorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: wp("2%"),
    marginVertical: hp("1%"),
    flex: 1,
  },
  numericSelectorTitle: {
    fontSize: wp("3.8%"),
    color: "#333333",
    marginBottom: hp("1%"),
    fontWeight: "500",
  },
  numericSelectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.5%"),
    width: "100%",
  },
  numericButton: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  numericValue: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: wp("3%"),
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: hp("1%"),
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