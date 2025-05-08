import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import IconMenuButton from "../Agencybrokage/Menubotton";
import FilterAG_B from "../../components/RealState/FilterAG_B";

// Importaciones de Firebase
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";

const { width, height } = Dimensions.get('window');

export default function Agencymapa() {
  const [origin, setOrigin] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false); // Estado para controlar la visibilidad del filtro
  const [activeFilters, setActiveFilters] = useState({
    mostrarPublicaciones: true
  }); // Estado para mantener los filtros activos
  
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    getLocationPermission(); // Obtener permiso de ubicación al montar el componente
    loadPublications(); // Cargar publicaciones desde Firestore
  }, []);

  // Filtrar publicaciones según el texto de búsqueda
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPublications([]);
      return;
    }

    const searchTerms = searchText.toLowerCase().trim();
    const filtered = publications.filter(pub => 
      (pub.direccion && pub.direccion.toLowerCase().includes(searchTerms)) ||
      (pub.tipoPropiedad && pub.tipoPropiedad.toLowerCase().includes(searchTerms)) ||
      (pub.descripcion && pub.descripcion.toLowerCase().includes(searchTerms))
    );
    
    setFilteredPublications(filtered);
  }, [searchText, publications]);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied");
      Alert.alert("Permiso denegado", "No se puede acceder a la ubicación");
      // Establecer una ubicación por defecto (Santiago de Chile)
      const defaultLocation = {
        latitude: -33.447487,
        longitude: -70.673676,
      };
      setOrigin(defaultLocation);
      setMarkerPosition(defaultLocation);
      return;
    }

    // Obtener la ubicación actual
    try {
      const location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setOrigin(currentLocation);
      setMarkerPosition(currentLocation);
      
      // Animar el mapa a la ubicación actual cuando se monte el componente
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...currentLocation,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        });
      }
    } catch (error) {
      handleError(error, "Error al obtener la ubicación");
    }
  };

  // Función centralizada para manejar errores
  const handleError = (error, customMessage) => {
    console.error(`${customMessage}:`, error);
    Alert.alert(
      "Error", 
      `${customMessage}. ${error.message}`
    );
  };

  const loadPublications = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Consultar todas las publicaciones que tienen coordenadas
      const publicationsQuery = query(
        collection(db, "publicaciones")
      );
      
      console.log("Ejecutando consulta para todas las publicaciones");
      const snapshot = await getDocs(publicationsQuery);
      
      console.log(`Documentos encontrados: ${snapshot.docs.length}`);
      
      // Filtrar solo las publicaciones que tienen ubicación
      const publicationsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(pub => pub.ubicacion && pub.ubicacion.latitude && pub.ubicacion.longitude);
      
      setPublications(publicationsData);
      console.log(`Publicaciones con ubicación: ${publicationsData.length}`);
      
    } catch (error) {
      handleError(error, "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el formulario de filtros
  const openFilterForm = () => {
    setShowFilterForm(true);
    // Si estamos mostrando el formulario, aseguramos que se oculten los resultados de búsqueda
    setShowSearchResults(false);
  };

  // Función para aplicar los filtros
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log("Filtros aplicados:", filters);
    
    // Lógica para aplicar filtros a las publicaciones
    let filteredPublications = [...publications];
    
    // Visibilidad de publicaciones
    if (!filters.mostrarPublicaciones) {
      // Si no se deben mostrar publicaciones, vaciar el array
      filteredPublications = [];
    } else {
      // Solo filtrar si hay publicaciones para mostrar
      // Filtrar por tipo de propiedad
      if (filters.tipoPropiedad) {
        filteredPublications = filteredPublications.filter(
          pub => pub.tipoPropiedad === filters.tipoPropiedad
        );
      }
      
      // Filtrar por operación
      if (filters.operacion) {
        filteredPublications = filteredPublications.filter(
          pub => pub.operacion === filters.operacion
        );
      }
      
      // Filtrar por estado de propiedad
      if (filters.estadoPropiedad) {
        filteredPublications = filteredPublications.filter(
          pub => pub.estado === filters.estadoPropiedad
        );
      }
      
      // Filtrar por precio mínimo
      if (filters.precioMin) {
        filteredPublications = filteredPublications.filter(
          pub => (pub.precioMin && pub.precioMin >= filters.precioMin) || 
                 (pub.precioMax && pub.precioMax >= filters.precioMin)
        );
      }
      
      // Filtrar por precio máximo
      if (filters.precioMax) {
        filteredPublications = filteredPublications.filter(
          pub => (!pub.precioMin || pub.precioMin <= filters.precioMax)
        );
      }
      
      // Filtrar por número de habitaciones
      if (filters.habitaciones) {
        filteredPublications = filteredPublications.filter(
          pub => pub.habitaciones >= filters.habitaciones
        );
      }
      
      // Filtrar por número de baños
      if (filters.banos) {
        filteredPublications = filteredPublications.filter(
          pub => pub.banos >= filters.banos
        );
      }
    }
    
    // Actualizar las publicaciones con los filtros aplicados
    setPublications(filteredPublications);
    
    // Mostrar notificación de filtros aplicados si hay una diferencia
    if (filteredPublications.length < publications.length) {
      Alert.alert(
        "Filtros aplicados", 
        `Mostrando ${filteredPublications.length} de ${publications.length} publicaciones`
      );
    }
  };

  const goToOrigin = () => {
    if (origin && mapRef.current) {
      mapRef.current.animateToRegion({
        ...origin,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      });
      setMarkerPosition(origin);
    }
  };

  // Función para ir a la ubicación de una propiedad seleccionada
  const navigateToProperty = (property) => {
    if (property.ubicacion && mapRef.current) {
      // Cerrar resultados de búsqueda
      setShowSearchResults(false);
      setSearchText("");
      Keyboard.dismiss();
      
      // Animar el mapa a la ubicación de la propiedad
      mapRef.current.animateToRegion({
        latitude: property.ubicacion.latitude,
        longitude: property.ubicacion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Función para cerrar el teclado al tocar fuera de la búsqueda
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (!searchText) {
      setShowSearchResults(false);
    }
  };

  // Función para formatear precio
  const formatPrice = (min, max) => {
    if (min === 0 && max === 0) return "Precio a convenir";
    if (min === 0) return `$${max.toLocaleString()} CLP`;
    if (max === 0) return `$${min.toLocaleString()} CLP`;
    return `$${min.toLocaleString()} CLP`;
  };

  // Renderizar cada elemento de la lista de resultados
  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => navigateToProperty(item)}
    >
      <View style={styles.searchResultIconContainer}>
        <Ionicons 
          name={item.tipoPropiedad === "Casa" ? "home" : "business"} 
          size={20} 
          color="green" 
        />
      </View>
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultTitle}>{item.tipoPropiedad} en {item.operacion}</Text>
        <Text style={styles.searchResultPrice}>{formatPrice(item.precioMin, item.precioMax)}</Text>
        <Text style={styles.searchResultAddress} numberOfLines={1}>{item.direccion}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="green" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: origin?.latitude || -33.447487, // Valor por defecto (Santiago de Chile)
              longitude: origin?.longitude || -70.673676,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onPress={dismissKeyboard}
          >
            {/* Renderizar marcadores para cada publicación (solo si son visibles) */}
            {activeFilters.mostrarPublicaciones && publications.map((publication) => (
              <Marker
                key={publication.id}
                coordinate={{
                  latitude: publication.ubicacion.latitude,
                  longitude: publication.ubicacion.longitude,
                }}
                title={publication.tipoPropiedad}
                description={publication.direccion}
                pinColor={publication.operacion === "Venta" ? "#FF3B30" : "green"}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>
                      {publication.tipoPropiedad} en {publication.operacion}
                    </Text>
                    <Text style={styles.calloutPrice}>
                      {formatPrice(publication.precioMin, publication.precioMax)}
                    </Text>
                    <Text style={styles.calloutAddress}>
                      {publication.direccion}
                    </Text>
                    <Text style={styles.calloutDescription} numberOfLines={2}>
                      {publication.descripcion}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={`Buscar entre ${publications.length} propiedades...`}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setShowSearchResults(true)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchText("");
                  setShowSearchResults(false);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Resultados de búsqueda */}
          {showSearchResults && searchText.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={filteredPublications}
                renderItem={renderSearchResultItem}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyResultsContainer}>
                    <Text style={styles.emptyResultsText}>No se encontraron propiedades</Text>
                  </View>
                }
              />
            </View>
          )}
        </View>

        {/* Botón para mostrar filtros */}
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={openFilterForm}
        >
          <Ionicons name="options" size={20} color="white" />
        </TouchableOpacity>

        {/* Botón para volver a la ubicación actual */}
        <TouchableOpacity style={styles.button} onPress={goToOrigin}>
          <Icon style={styles.buttonText} name="location-crosshairs" />
        </TouchableOpacity>

        {/* Botón de recarga de publicaciones */}
        <TouchableOpacity 
          style={styles.reloadButton} 
          onPress={loadPublications}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>

        {/* Mostrar el formulario de filtro cuando showFilterForm es true */}
        {showFilterForm && (
          <FilterAG_B 
            onClose={() => setShowFilterForm(false)} 
            onApplyFilters={applyFilters}
            initialFilters={activeFilters} // Pasar los filtros actuales
          />
        )}

        <IconMenuButton />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    width: width - 150,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  searchResultsContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    marginTop: 10,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  searchResultAddress: {
    fontSize: 12,
    color: "#666",
  },
  emptyResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyResultsText: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "green",
    padding: 14,
    borderRadius: 40,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  reloadButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "green",
    padding: 14,
    borderRadius: 40,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  // Botón de filtro
  filterButton: {
    position: "absolute",
    top: 45,
    right: 90,
    backgroundColor: "green",
    padding: 12,
    borderRadius: 40,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  calloutPrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: "green",
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
  },
});