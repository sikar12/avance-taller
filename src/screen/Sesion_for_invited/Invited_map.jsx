import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  FlatList,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Image
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Importamos el componente FilterForm
import FilterForm from "../../components/FilterForm";
// Importamos el componente PropertyDetailModal
import PropertyDetailModal from "../../components/PropertyDetailModal";

// Importaciones de Firebase
import {
  getFirestore,
  collection,
  query,
  getDocs,
  limit,
} from "firebase/firestore";

export default function Invited_map() {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  // Estado para guardar las publicaciones y proyectos originales sin filtrar
  const [allPublications, setAllPublications] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  // Estado para mostrar las publicaciones y proyectos filtrados
  const [publications, setPublications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false); // Estado para controlar la visibilidad del filtro
  const [activeFilters, setActiveFilters] = useState({
    mostrarPublicaciones: true,
    mostrarProyectos: true
  }); // Estado para mantener los filtros activos
  
  // Estado para la visualización dinámica
  const [currentRegion, setCurrentRegion] = useState(null);
  const [visiblePublications, setVisiblePublications] = useState([]);
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [maxDistance, setMaxDistance] = useState(10); // Distancia máxima en km para mostrar marcadores
  
  // Estados para el modal de detalles
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyType, setPropertyType] = useState(null); // 'publication' o 'project'
  const [modalVisible, setModalVisible] = useState(false);
  
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    getLocationPermission(); // Obtener permiso de ubicación al montar el componente
    loadAllData(); // Cargar todas las publicaciones y proyectos desde Firestore
  }, []);
  
  // Efecto para filtrar las propiedades visibles basado en la distancia
  useEffect(() => {
    if (!currentRegion) return;
    
    // Calcula las propiedades visibles basado en la distancia desde el centro del mapa
    updateVisibleProperties();
  }, [currentRegion, publications, projects, maxDistance]);

  // Filtrar elementos según el texto de búsqueda
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredItems([]);
      return;
    }

    const searchTerms = searchText.toLowerCase().trim();
    
    // Filtrar publicaciones (solo si están visibles según los filtros)
    const filteredPublications = activeFilters.mostrarPublicaciones 
      ? publications.filter(pub => 
          (pub.direccion && pub.direccion.toLowerCase().includes(searchTerms)) ||
          (pub.tipoPropiedad && pub.tipoPropiedad.toLowerCase().includes(searchTerms)) ||
          (pub.descripcion && pub.descripcion.toLowerCase().includes(searchTerms))
        ).map(pub => ({...pub, itemType: 'publication'}))
      : [];
    
    // Filtrar proyectos (solo si están visibles según los filtros)
    const filteredProjects = activeFilters.mostrarProyectos
      ? projects.filter(proj => 
          (proj.direccion && proj.direccion.toLowerCase().includes(searchTerms)) ||
          (proj.tipoProyecto && proj.tipoProyecto.toLowerCase().includes(searchTerms)) ||
          (proj.nombreProyecto && proj.nombreProyecto.toLowerCase().includes(searchTerms)) ||
          (proj.descripcion && proj.descripcion.toLowerCase().includes(searchTerms))
        ).map(proj => ({...proj, itemType: 'project'}))
      : [];
    
    // Combinar resultados
    setFilteredItems([...filteredPublications, ...filteredProjects]);
  }, [searchText, publications, projects, activeFilters]);

  // Función para aplicar los filtros
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log("Filtros aplicados:", filters);
    
    // Empezamos desde las colecciones completas
    let filteredPublications = [...allPublications];
    let filteredProjects = [...allProjects];
    
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
    
    // Visibilidad de proyectos
    if (!filters.mostrarProyectos) {
      // Si no se deben mostrar proyectos, vaciar el array
      filteredProjects = [];
    } else {
      // Solo filtrar si hay proyectos para mostrar
      // Filtrar por tipo de proyecto
      if (filters.tipoProyecto) {
        filteredProjects = filteredProjects.filter(
          proj => proj.tipoProyecto === filters.tipoProyecto
        );
      }
      
      // Filtrar por estado de proyecto
      if (filters.estadoProyecto) {
        filteredProjects = filteredProjects.filter(
          proj => proj.estadoProyecto === filters.estadoProyecto
        );
      }
      
      // Filtrar por precio mínimo
      if (filters.precioMin) {
        filteredProjects = filteredProjects.filter(
          proj => (!proj.precioDesde || proj.precioDesde >= filters.precioMin)
        );
      }
      
      // Filtrar por precio máximo
      if (filters.precioMax) {
        filteredProjects = filteredProjects.filter(
          proj => (!proj.precioDesde || proj.precioDesde <= filters.precioMax)
        );
      }
    }
    
    // Actualizar el estado con los datos filtrados
    setPublications(filteredPublications);
    setProjects(filteredProjects);
    
    // Mostrar notificación de filtros aplicados si hay una diferencia
    let countFiltered = filteredPublications.length + filteredProjects.length;
    let countTotal = allPublications.length + allProjects.length;
    
    if (countFiltered < countTotal) {
      Alert.alert(
        "Filtros aplicados", 
        `Mostrando ${countFiltered} de ${countTotal} items`
      );
    }
  };

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
      Alert.alert(
        "Error de ubicación", 
        "No se pudo obtener tu ubicación actual. Verifica los permisos de ubicación."
      );
      
      // Establecer una ubicación por defecto (Santiago de Chile)
      const defaultLocation = {
        latitude: -33.447487,
        longitude: -70.673676,
      };
      setOrigin(defaultLocation);
      setMarkerPosition(defaultLocation);
    }
  };

  // Función para abrir el formulario de filtros
  const openFilterForm = () => {
    setShowFilterForm(true);
    // Si estamos mostrando el formulario, aseguramos que se oculten los resultados de búsqueda
    setShowSearchResults(false);
  };

  // Esta es la función principal que cambiamos para cargar TODOS los datos, no solo los del usuario actual
  const loadAllData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Cargar todas las publicaciones (sin filtrar por usuario)
      await loadAllPublications(db);
      
      // Cargar todos los proyectos (sin filtrar por usuario)
      await loadAllProjects(db);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert(
        "Error de conexión", 
        "No se pudieron cargar las propiedades. Comprueba tu conexión a internet e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Función modificada para cargar TODAS las publicaciones disponibles
  const loadAllPublications = async (db) => {
    try {
      // Consultar todas las publicaciones (sin filtrar por usuario)
      // Limitamos a un número razonable para evitar sobrecarga (opcional)
      const publicationsQuery = query(
        collection(db, "publicaciones"),
        limit(100) // Limitar a 100 publicaciones para mejor rendimiento
      );
      
      console.log("Ejecutando consulta para todas las publicaciones disponibles");
      const snapshot = await getDocs(publicationsQuery);
      
      console.log(`Documentos de publicaciones encontrados: ${snapshot.docs.length}`);
      
      // Filtrar solo las publicaciones que tienen ubicación
      const publicationsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(pub => pub.ubicacion && pub.ubicacion.latitude && pub.ubicacion.longitude);
      
      setAllPublications(publicationsData);  // Guardar todas las publicaciones
      setPublications(publicationsData);     // Establecer las publicaciones filtradas (inicialmente todas)
      console.log(`Publicaciones con ubicación: ${publicationsData.length}`);
      
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      throw error; // Propagar error para manejo centralizado
    }
  };

  // Función modificada para cargar TODOS los proyectos disponibles
  const loadAllProjects = async (db) => {
    try {
      // Consultar todos los proyectos (sin filtrar por usuario)
      // Limitamos a un número razonable para evitar sobrecarga (opcional)
      const projectsQuery = query(
        collection(db, "proyectos"),
        limit(100) // Limitar a 100 proyectos para mejor rendimiento
      );
      
      console.log("Ejecutando consulta para todos los proyectos disponibles");
      const snapshot = await getDocs(projectsQuery);
      
      console.log(`Documentos de proyectos encontrados: ${snapshot.docs.length}`);
      
      // Filtrar solo los proyectos que tienen ubicación
      const projectsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(proj => proj.ubicacion && proj.ubicacion.latitude && proj.ubicacion.longitude);
      
      setAllProjects(projectsData);  // Guardar todos los proyectos
      setProjects(projectsData);     // Establecer los proyectos filtrados (inicialmente todos)
      console.log(`Proyectos con ubicación: ${projectsData.length}`);
      
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      throw error; // Propagar error para manejo centralizado
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

  // Función para ir a la ubicación de una propiedad o proyecto seleccionado
  const navigateToItem = (item) => {
    if (item.ubicacion && mapRef.current) {
      // Cerrar resultados de búsqueda
      setShowSearchResults(false);
      setSearchText("");
      Keyboard.dismiss();
      
      // Animar el mapa a la ubicación del item
      mapRef.current.animateToRegion({
        latitude: item.ubicacion.latitude,
        longitude: item.ubicacion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Si el item tiene itemType, lo usamos para mostrar el modal
      if (item.itemType) {
        setSelectedProperty(item);
        setPropertyType(item.itemType);
        setModalVisible(true);
      }
    }
  };

  // Función para formatear precio
  const formatPrice = (min, max) => {
    if (!min && !max) return "Precio a convenir";
    if (!min) return `$${max.toLocaleString()} CLP`;
    if (!max) return `$${min.toLocaleString()} CLP`;
    return `$${min.toLocaleString()} CLP`;
  };
  
  // Nueva función para manejar el clic en un marcador de publicación
  const handlePublicationPress = (publication) => {
    setSelectedProperty(publication);
    setPropertyType('publication');
    setModalVisible(true);
  };
  
  // Nueva función para manejar el clic en un marcador de proyecto
  const handleProjectPress = (project) => {
    setSelectedProperty(project);
    setPropertyType('project');
    setModalVisible(true);
  };

  // Renderizar cada elemento de la lista de resultados
  const renderSearchResultItem = ({ item }) => {
    const isProject = item.itemType === 'project';
    
    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => navigateToItem(item)}
      >
        <View style={styles.searchResultIconContainer}>
          <Ionicons 
            name={isProject ? "business" : (item.tipoPropiedad === "Casa" ? "home" : "business")} 
            size={20} 
            color={isProject ? "#009245" : "green"} 
          />
        </View>
        <View style={styles.searchResultInfo}>
          {isProject ? (
            <>
              <Text style={styles.searchResultTitle}>{item.nombreProyecto || "Proyecto"}</Text>
              <Text style={styles.searchResultPrice}>
                {item.precioDesde ? `Desde ${formatPrice(item.precioDesde, 0)}` : "Consultar precio"}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.searchResultTitle}>{item.tipoPropiedad} en {item.operacion}</Text>
              <Text style={styles.searchResultPrice}>{formatPrice(item.precioMin, item.precioMax)}</Text>
            </>
          )}
          <Text style={styles.searchResultAddress} numberOfLines={1}>{item.direccion}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  // Función para calcular la distancia entre dos coordenadas (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distancia en km
    return distance;
  };
  
  // Función para actualizar las propiedades visibles
  const updateVisibleProperties = () => {
    if (!currentRegion) return;
    
    // Calcular las propiedades que están dentro del radio de distancia
    const centerLat = currentRegion.latitude;
    const centerLon = currentRegion.longitude;
    
    // Calcular un factor de escala basado en el nivel de zoom (aproximado)
    // A medida que hacemos zoom, el radio de visibilidad disminuye
    const zoomFactor = Math.max(currentRegion.latitudeDelta, currentRegion.longitudeDelta) * 111; // 1 grado ≈ 111 km
    const dynamicDistance = Math.min(maxDistance, Math.max(1, zoomFactor)); // Entre 1 y maxDistance km
    
    // Filtrar publicaciones
    const newVisiblePublications = publications.filter(pub => {
      if (!pub.ubicacion) return false;
      
      const distance = calculateDistance(
        centerLat, 
        centerLon, 
        pub.ubicacion.latitude, 
        pub.ubicacion.longitude
      );
      
      return distance <= dynamicDistance;
    });
    
    // Filtrar proyectos
    const newVisibleProjects = projects.filter(proj => {
      if (!proj.ubicacion) return false;
      
      const distance = calculateDistance(
        centerLat, 
        centerLon, 
        proj.ubicacion.latitude, 
        proj.ubicacion.longitude
      );
      
      return distance <= dynamicDistance;
    });
    
    // Actualizar estados
    setVisiblePublications(newVisiblePublications);
    setVisibleProjects(newVisibleProjects);
    
    console.log(`Propiedades visibles: ${newVisiblePublications.length} publicaciones y ${newVisibleProjects.length} proyectos en un radio de ${dynamicDistance.toFixed(1)} km`);
  };
  
  // Función para manejar el cambio de región del mapa
  const handleRegionChange = (region) => {
    setCurrentRegion(region);
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (!searchText) {
      setShowSearchResults(false);
    }
  };
  
  const volver = () => {
    navigation.navigate("Homelogg");
  };

  // Función para cerrar el modal de detalles
  const closeModal = () => {
    setModalVisible(false);
    setSelectedProperty(null);
  };

  // Función para manejar el toque en el mapa (cerrar otros elementos UI)
  const handleMapPress = () => {
    dismissKeyboard();
  };

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
            onPress={handleMapPress}
            onRegionChangeComplete={handleRegionChange}
          >
            {/* Renderizar marcadores para cada publicación (solo si son visibles) */}
            {activeFilters.mostrarPublicaciones && visiblePublications.map((publication) => (
              <Marker
                key={`publication-${publication.id}`}
                coordinate={{
                  latitude: publication.ubicacion.latitude,
                  longitude: publication.ubicacion.longitude,
                }}
                title={publication.tipoPropiedad}
                description={publication.direccion}
                pinColor={publication.operacion === "Venta" ? "#FF3B30" : "green"}
                onPress={() => handlePublicationPress(publication)}
              />
            ))}
            
            {/* Renderizar marcadores para cada proyecto (solo si son visibles) */}
            {activeFilters.mostrarProyectos && visibleProjects.map((project) => (
              <Marker
                key={`project-${project.id}`}
                coordinate={{
                  latitude: project.ubicacion.latitude,
                  longitude: project.ubicacion.longitude,
                }}
                title={project.nombreProyecto || "Proyecto"}
                description={project.direccion}
                pinColor="#009245" // Color diferente para proyectos
                onPress={() => handleProjectPress(project)}
              >
                <View style={styles.projectMarker}>
                  <Ionicons name="business" size={20} color="white" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Barra de búsqueda mejorada */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={`Buscar en ${publications.length + projects.length} propiedades`}
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
                data={filteredItems}
                renderItem={renderSearchResultItem}
                keyExtractor={(item) => `${item.itemType || 'item'}-${item.id}`}
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
        
        {/* Botón para volver */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={volver}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>

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

        {/* Botón de recarga de datos */}
        <TouchableOpacity 
          style={styles.reloadButton} 
          onPress={loadAllData}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>

        {/* Mostrar el formulario de filtro cuando showFilterForm es true */}
        {showFilterForm && (
          <FilterForm 
            onClose={() => setShowFilterForm(false)} 
            onApplyFilters={applyFilters}
            initialFilters={activeFilters} // Pasar los filtros actuales
          />
        )}
        
        {/* Badge con contador de propiedades */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {visiblePublications.length + visibleProjects.length} / {publications.length + projects.length} propiedades
          </Text>
        </View>
        
        {/* Control de rango para ajustar la distancia de visualización */}
        <View style={styles.rangeControlContainer}>
          <Text style={styles.rangeLabel}>Radio de visualización: {maxDistance} km</Text>
          <View style={styles.rangeSlider}>
            <TouchableOpacity 
              style={styles.rangeButton}
              onPress={() => setMaxDistance(Math.max(1, maxDistance - 1))}
            >
              <Text style={styles.rangeButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.rangeTrack}>
              <View style={[styles.rangeFill, { width: `${(maxDistance / 20) * 100}%` }]} />
            </View>
            
            <TouchableOpacity 
              style={styles.rangeButton}
              onPress={() => setMaxDistance(Math.min(20, maxDistance + 1))}
            >
              <Text style={styles.rangeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de Detalles de Propiedad */}
        <PropertyDetailModal
          visible={modalVisible}
          onClose={closeModal}
          property={selectedProperty}
          type={propertyType}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const { width, height } = Dimensions.get('window');

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
    left: "20%",
    right: 0,
    width: width - 150,
    paddingHorizontal: 10,
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
    fontSize: 20,
    color: "#333",
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
    padding: "25%",
    alignItems: "center",
  },
  emptyResultsText: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 45,
    left: 10,
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
    zIndex: 5,
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
    right: 10,
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
  calloutProjectTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#009245",
  },
  calloutProjectType: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
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
  projectMarker: {
    backgroundColor: "#009245",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  countBadge: {
    position: "absolute",
    bottom: 140,
    right: 20,
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green",
  },
  rangeControlContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 80,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  rangeSlider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
  },
  rangeTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  rangeFill: {
    height: "100%",
    backgroundColor: "green",
    borderRadius: 3,
  },
  rangeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  rangeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});