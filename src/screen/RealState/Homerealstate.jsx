// Componente actualizado para mostrar tanto proyectos como publicaciones
import { StatusBar } from "expo-status-bar";
import * as React from "react";
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
} from "react-native";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import MenuButton from "./Menu"; // Importamos el componente FilterForm
import FilterForm from "../../components/FilterForm";// Importamos el componente FilterForm

// Importaciones de Firebase
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export default function HomemapsRealstate() {
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
  
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    getLocationPermission(); // Obtener permiso de ubicación al montar el componente
    loadUserData(); // Cargar publicaciones y proyectos del usuario desde Firestore
  }, []);

  // Filtrar elementos según el texto de búsqueda
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredItems([]);
      return;
    }

    const searchTerms = searchText.toLowerCase().trim();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log("No hay usuario autenticado para filtrar búsqueda");
      setFilteredItems([]);
      return;
    }
    
    const userId = currentUser.uid;
    
    // Filtrar publicaciones (solo si están visibles según los filtros y son del usuario actual)
    const filteredPublications = activeFilters.mostrarPublicaciones 
      ? publications.filter(pub => 
          pub.userId === userId && (
            (pub.direccion && pub.direccion.toLowerCase().includes(searchTerms)) ||
            (pub.tipoPropiedad && pub.tipoPropiedad.toLowerCase().includes(searchTerms)) ||
            (pub.descripcion && pub.descripcion.toLowerCase().includes(searchTerms))
          )
        ).map(pub => ({...pub, itemType: 'publication'}))
      : [];
    
    // Filtrar proyectos (solo si están visibles según los filtros y son del usuario actual)
    const filteredProjects = activeFilters.mostrarProyectos
      ? projects.filter(proj => 
          proj.userId === userId && (
            (proj.direccion && proj.direccion.toLowerCase().includes(searchTerms)) ||
            (proj.tipoProyecto && proj.tipoProyecto.toLowerCase().includes(searchTerms)) ||
            (proj.nombreProyecto && proj.nombreProyecto.toLowerCase().includes(searchTerms)) ||
            (proj.descripcion && proj.descripcion.toLowerCase().includes(searchTerms))
          )
        ).map(proj => ({...proj, itemType: 'project'}))
      : [];
    
    // Combinar resultados
    setFilteredItems([...filteredPublications, ...filteredProjects]);
    console.log(`Resultados de búsqueda para ${userId}: ${filteredPublications.length} publicaciones, ${filteredProjects.length} proyectos`);
  }, [searchText, publications, projects, activeFilters]);

  // Función para aplicar los filtros
  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log("Filtros aplicados:", filters);
    
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log("No hay usuario autenticado para aplicar filtros");
      return;
    }
    
    const userId = currentUser.uid;
    
    // Empezamos desde las colecciones completas
    let filteredPublications = [...allPublications].filter(pub => pub.userId === userId);
    let filteredProjects = [...allProjects].filter(proj => proj.userId === userId);
    
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
    let countTotal = allPublications.filter(pub => pub.userId === userId).length + 
                     allProjects.filter(proj => proj.userId === userId).length;
    
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

  // Función centralizada para manejar errores
  const handleError = (error, customMessage) => {
    console.error(`${customMessage}:`, error);
    Alert.alert(
      "Error", 
      `${customMessage}. ${error.message}`
    );
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log("No hay usuario autenticado");
        Alert.alert("Sesión no iniciada", "Debes iniciar sesión para ver tus propiedades");
        setLoading(false);
        return;
      }
      
      // Cargar publicaciones del usuario actual
      await loadPublications(db, currentUser.uid);
      
      // Cargar proyectos del usuario actual
      await loadProjects(db, currentUser.uid);
      
    } catch (error) {
      handleError(error, "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const loadPublications = async (db, userId) => {
    try {
      // Consultar SOLO las publicaciones del usuario actual
      const publicationsQuery = query(
        collection(db, "publicaciones"),
        where("userId", "==", userId)
      );
      
      console.log("Ejecutando consulta para publicaciones del usuario:", userId);
      const snapshot = await getDocs(publicationsQuery);
      
      console.log(`Documentos de publicaciones encontrados: ${snapshot.docs.length}`);
      
      // Filtrar solo las publicaciones que tienen ubicación Y pertenecen al usuario actual
      const publicationsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(pub => 
          pub.ubicacion && 
          pub.ubicacion.latitude && 
          pub.ubicacion.longitude && 
          pub.userId === userId // Verificación adicional de userId
        );
      
      setAllPublications(publicationsData);  // Guardar todas las publicaciones
      setPublications(publicationsData);     // Establecer las publicaciones filtradas (inicialmente todas)
      console.log(`Publicaciones con ubicación del usuario ${userId}: ${publicationsData.length}`);
      
    } catch (error) {
      handleError(error, "Error al cargar publicaciones");
    }
  };

  const loadProjects = async (db, userId) => {
    try {
      // Consultar SOLO los proyectos del usuario actual
      const projectsQuery = query(
        collection(db, "proyectos"),
        where("userId", "==", userId)
      );
      
      console.log("Ejecutando consulta para proyectos del usuario:", userId);
      const snapshot = await getDocs(projectsQuery);
      
      console.log(`Documentos de proyectos encontrados: ${snapshot.docs.length}`);
      
      // Filtrar solo los proyectos que tienen ubicación Y pertenecen al usuario actual
      const projectsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(proj => 
          proj.ubicacion && 
          proj.ubicacion.latitude && 
          proj.ubicacion.longitude && 
          proj.userId === userId // Verificación adicional de userId
        );
      
      setAllProjects(projectsData);  // Guardar todos los proyectos
      setProjects(projectsData);     // Establecer los proyectos filtrados (inicialmente todos)
      console.log(`Proyectos con ubicación del usuario ${userId}: ${projectsData.length}`);
      
    } catch (error) {
      handleError(error, "Error al cargar proyectos");
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
    }
  };

  // Función para formatear precio
  const formatPrice = (min, max) => {
    if (!min && !max) return "Precio a convenir";
    if (!min) return `$${max.toLocaleString()} CLP`;
    if (!max) return `$${min.toLocaleString()} CLP`;
    return `$${min.toLocaleString()} CLP`;
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (!searchText) {
      setShowSearchResults(false);
    }
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
            onPress={dismissKeyboard}
          >
            {/* Renderizar marcadores para cada publicación (solo si son visibles) */}
            {activeFilters.mostrarPublicaciones && publications.map((publication) => {
              // Verificar que la publicación pertenezca al usuario actual
              const auth = getAuth();
              const currentUser = auth.currentUser;
              
              if (!currentUser || publication.userId !== currentUser.uid) {
                return null;
              }
              
              return (
                <Marker
                  key={`publication-${publication.id}`}
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
              );
            })}
            
            {/* Renderizar marcadores para cada proyecto (solo si son visibles) */}
            {activeFilters.mostrarProyectos && projects.map((project) => {
              // Verificar que el proyecto pertenezca al usuario actual
              const auth = getAuth();
              const currentUser = auth.currentUser;
              
              if (!currentUser || project.userId !== currentUser.uid) {
                return null;
              }
              
              return (
                <Marker
                  key={`project-${project.id}`}
                  coordinate={{
                    latitude: project.ubicacion.latitude,
                    longitude: project.ubicacion.longitude,
                  }}
                  title={project.nombreProyecto || "Proyecto"}
                  description={project.direccion}
                  pinColor="#009245" // Color diferente para proyectos
                >
                  <View style={styles.projectMarker}>
                    <Ionicons name="business" size={20} color="white" />
                  </View>
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutProjectTitle}>
                        {project.nombreProyecto || "Proyecto"}
                      </Text>
                      <Text style={styles.calloutProjectType}>
                        {project.tipoProyecto}
                      </Text>
                      <Text style={styles.calloutPrice}>
                        {project.precioDesde ? `Desde ${formatPrice(project.precioDesde, 0)}` : "Consultar precio"}
                      </Text>
                      <Text style={styles.calloutAddress}>
                        {project.direccion}
                      </Text>
                      <Text style={styles.calloutDescription} numberOfLines={2}>
                        {project.descripcion}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
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
                keyExtractor={(item) => `${item.itemType}-${item.id}`}
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

        {/* Botón de recarga de datos */}
        <TouchableOpacity 
          style={styles.reloadButton} 
          onPress={loadUserData}
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

        <MenuButton />
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
});