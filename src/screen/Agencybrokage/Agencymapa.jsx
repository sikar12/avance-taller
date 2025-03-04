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
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import IconMenuButton from "../Agencybrokage/Menubotton";

// Importaciones de Firebase
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";

export default function Agencymapa() {
  const [origin, setOrigin] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapRef = useRef(null);

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
      console.error("Error al obtener la ubicación:", error);
      Alert.alert("Error", "No se pudo obtener tu ubicación actual");
    }
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
      console.error("Error al cargar publicaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las publicaciones para el mapa");
    } finally {
      setLoading(false);
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
      
      // Animar el mapa a la ubicación de la propiedad
      mapRef.current.animateToRegion({
        latitude: property.ubicacion.latitude,
        longitude: property.ubicacion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
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
          color="#009245" 
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009245" />
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
        >
          {/* Renderizar marcadores para cada publicación */}
          {publications.map((publication) => (
            <Marker
              key={publication.id}
              coordinate={{
                latitude: publication.ubicacion.latitude,
                longitude: publication.ubicacion.longitude,
              }}
              title={publication.tipoPropiedad}
              description={publication.direccion}
              pinColor={publication.operacion === "Venta" ? "#FF3B30" : "#009245"}
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

      <IconMenuButton />
    </View>
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
    left: 10,
    width: "70%",
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
    color: "#009245",
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
    backgroundColor: "#009245",
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
    backgroundColor: "#009245",
    padding: 14,
    borderRadius: 40,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#009245",
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