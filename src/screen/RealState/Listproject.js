import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function ListProject() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' o 'publications'

  // Cargar datos cuando el componente se monta o cuando vuelve a estar en foco
  useFocusEffect(
    React.useCallback(() => {
      loadData();
      return () => {}; // Función de limpieza opcional
    }, [])
  );

  const loadData = async () => {
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
      
      // Cargar proyectos
      await loadProjects(db, uid);
      
      // Cargar publicaciones
      await loadPublications(db, uid);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProjects = async (db, uid) => {
    try {
      // Solución temporal sin orderBy para evitar el error de índice
      const projectsQuery = query(
        collection(db, "proyectos"),
        where("userId", "==", uid)
      );
      
      const snapshot = await getDocs(projectsQuery);
      
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        itemType: "project", // Añadir identificador de tipo
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date(),
      }));
      
      // Ordenamos manualmente los resultados después de obtenerlos
      projectsData.sort((a, b) => b.createdAt - a.createdAt);
      
      setProjects(projectsData);
      console.log(`Proyectos cargados: ${projectsData.length}`);
      
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      Alert.alert("Error", "No se pudieron cargar los proyectos: " + error.message);
    }
  };

  const loadPublications = async (db, uid) => {
    try {
      // Solución temporal sin orderBy para evitar el error de índice
      const publicationsQuery = query(
        collection(db, "publicaciones"),
        where("userId", "==", uid)
      );
      
      const snapshot = await getDocs(publicationsQuery);
      
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        itemType: "publication", // Añadir identificador de tipo
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date(),
      }));
      
      // Ordenamos manualmente los resultados después de obtenerlos
      publicationsData.sort((a, b) => b.createdAt - a.createdAt);
      
      setPublications(publicationsData);
      console.log(`Publicaciones cargadas: ${publicationsData.length}`);
      
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las publicaciones: " + error.message);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEdit = (item) => {
    if (item.itemType === "project") {
      navigation.navigate("EditProject", { project: item });
    } else {
      navigation.navigate("EditPublication", { publication: item });
    }
  };

  const handleDelete = async (item) => {
    try {
      const db = getFirestore();
      const collectionName = item.itemType === "project" ? "proyectos" : "publicaciones";
      
      await deleteDoc(doc(db, collectionName, item.id));
      
      // Actualizar el estado local para eliminar el elemento
      if (item.itemType === "project") {
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== item.id)
        );
      } else {
        setPublications(prevPublications => 
          prevPublications.filter(publication => publication.id !== item.id)
        );
      }
      
      Alert.alert("Éxito", `${item.itemType === "project" ? "Proyecto" : "Publicación"} eliminado correctamente`);
    } catch (error) {
      console.error("Error al eliminar elemento:", error);
      Alert.alert("Error", `No se pudo eliminar el ${item.itemType === "project" ? "proyecto" : "publicación"}: ` + error.message);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar ${item.itemType === "project" ? "este proyecto" : "esta publicación"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => handleDelete(item)
        }
      ]
    );
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Función para formatear precio
  const formatPrice = (min, max) => {
    if (!min && !max) return "Precio a convenir";
    if (!min) return `$${max.toLocaleString()} CLP`;
    if (!max) return `$${min.toLocaleString()} CLP`;
    return `$${min.toLocaleString()} CLP`;
  };

  const renderProject = ({ item }) => {
    const price = item.precioDesde ? formatPrice(item.precioDesde, 0) : "Consultar precio";
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => openItemDetail(item)}
      >
        <Image 
          source={item.imagenUrl ? { uri: item.imagenUrl } : require("../../../assets/Perfil.png")} 
          style={styles.propertyImage}
        />
        
        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle}>{item.nombreProyecto || "Proyecto sin nombre"}</Text>
          
          <View style={styles.propertyDetails}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={16} color="#009245" />
              <Text style={styles.propertyType}>{item.tipoProyecto || "Proyecto Inmobiliario"}</Text>
            </View>
            
            <View style={styles.iconContainer}>
              <Ionicons name="construct" size={16} color="#009245" />
              <Text style={styles.propertyStatus}>{item.estadoProyecto || "En desarrollo"}</Text>
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#FF3B30" />
            <Text style={styles.address} numberOfLines={1}>
              {item.direccion || "Sin dirección especificada"}
            </Text>
          </View>
          
          <Text style={styles.price}>{price}</Text>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={2}>
              {item.descripcion || "No hay descripción disponible para este proyecto."}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#009245" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPublication = ({ item }) => {
    // Obtener tipo de operación para mostrar
    const getOperationType = (operacion) => {
      if (operacion === "Venta") return "Propiedad en Venta";
      if (operacion === "Arriendo") return "Propiedad en Arriendo";
      return "Propiedad en Arriendo y Venta";
    };
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => openItemDetail(item)}
      >
        <Image 
          source={item.imagenUrl ? { uri: item.imagenUrl } : require("../../../assets/Perfil.png")} 
          style={styles.propertyImage}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.operationContainer}>
            <View style={styles.smallIconContainer}>
              <Ionicons name="home" size={20} color="#666" />
            </View>
            <View style={styles.operationInfo}>
              <Text style={styles.operationType}>{getOperationType(item.operacion)}</Text>
              <Text style={styles.price}>{formatPrice(item.precioMin, item.precioMax)}</Text>
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#FF3B30" />
            <Text style={styles.address} numberOfLines={1}>
              {item.direccion || "Sin dirección especificada"}
            </Text>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.description} numberOfLines={3}>
              {item.descripcion || "No hay descripción disponible para esta propiedad."}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#009245" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={activeTab === "projects" ? "business" : "home"} size={80} color="#CCCCCC" />
      <Text style={styles.emptyText}>
        {activeTab === "projects" ? "No tienes proyectos" : "No tienes publicaciones"}
      </Text>
      <Text style={styles.emptySubText}>
        {activeTab === "projects" 
          ? "Los proyectos que crees aparecerán aquí" 
          : "Las propiedades que publiques aparecerán aquí"}
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate(activeTab === "projects" ? "AddProject" : "AddPublication")}
      >
        <Text style={styles.addButtonText}>
          {activeTab === "projects" ? "Crear nuevo proyecto" : "Crear nueva publicación"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;
    
    const isProject = selectedItem.itemType === "project";
    
    // Formatear precio según el tipo de elemento
    const price = isProject 
      ? (selectedItem.precioDesde ? formatPrice(selectedItem.precioDesde, 0) : "Consultar precio")
      : formatPrice(selectedItem.precioMin, selectedItem.precioMax);
    
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{isProject ? "Proyecto" : "Publicación"}</Text>
          </View>
          
          <View style={styles.detailContainer}>
            <Image 
              source={
                selectedItem.imagenUrl 
                ? { uri: selectedItem.imagenUrl } 
                : require("../../../assets/Perfil.png")
              } 
              style={styles.detailImage}
            />
            
            <View style={styles.detailContent}>
              {isProject ? (
                // Contenido para proyectos
                <>
                  <Text style={styles.detailTitle}>{selectedItem.nombreProyecto || "Proyecto sin nombre"}</Text>
                  
                  <View style={styles.detailInfo}>
                    <View style={styles.detailInfoItem}>
                      <Ionicons name="business" size={18} color="#009245" />
                      <Text style={styles.detailInfoText}>{selectedItem.tipoProyecto || "Proyecto Inmobiliario"}</Text>
                    </View>
                    
                    <View style={styles.detailInfoItem}>
                      <Ionicons name="construct" size={18} color="#009245" />
                      <Text style={styles.detailInfoText}>{selectedItem.estadoProyecto || "En desarrollo"}</Text>
                    </View>
                    
                    {selectedItem.cantidadUnidades && (
                      <View style={styles.detailInfoItem}>
                        <Ionicons name="home" size={18} color="#009245" />
                        <Text style={styles.detailInfoText}>{selectedItem.cantidadUnidades} unidades</Text>
                      </View>
                    )}
                    
                    {selectedItem.fechaEntrega && (
                      <View style={styles.detailInfoItem}>
                        <Ionicons name="calendar" size={18} color="#009245" />
                        <Text style={styles.detailInfoText}>Entrega: {selectedItem.fechaEntrega}</Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                // Contenido para publicaciones
                <>
                  <View style={styles.detailOperationInfo}>
                    <Text style={styles.detailOperationType}>
                      {selectedItem.tipoPropiedad} en {selectedItem.operacion}
                    </Text>
                    <Text style={styles.detailOperationStatus}>
                      Estado: {selectedItem.estado || "No especificado"}
                    </Text>
                  </View>
                </>
              )}
              
              <View style={styles.addressDetailContainer}>
                <Ionicons name="location" size={18} color="#FF3B30" />
                <Text style={styles.addressDetail}>
                  {selectedItem.direccion || "Sin dirección especificada"}
                </Text>
              </View>
              
              <Text style={styles.detailPrice}>{price}</Text>
              
              <View style={styles.descriptionDetailContainer}>
                <Text style={styles.descriptionDetailTitle}>Descripción</Text>
                <Text style={styles.descriptionDetail}>
                  {selectedItem.descripcion || `No hay descripción disponible para ${isProject ? "este proyecto" : "esta propiedad"}.`}
                </Text>
              </View>
              
              <View style={styles.detailButtons}>
                <TouchableOpacity 
                  style={styles.editDetailButton}
                  onPress={() => {
                    closeModal();
                    handleEdit(selectedItem);
                  }}
                >
                  <Text style={styles.editDetailButtonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteDetailButton}
                  onPress={() => {
                    closeModal();
                    confirmDelete(selectedItem);
                  }}
                >
                  <Text style={styles.deleteDetailButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
        <Text style={styles.headerTitle}>Mis Proyectos y Publicaciones</Text>
        <TouchableOpacity 
          style={styles.addItemButton}
          onPress={() => navigation.navigate(activeTab === "projects" ? "AddProject" : "AddPublication")}
        >
          <Ionicons name="add" size={24} color="#009245" />
        </TouchableOpacity>
      </View>
      
      {/* Pestañas de navegación */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "projects" && styles.activeTab]}
          onPress={() => setActiveTab("projects")}
        >
          <Text 
            style={[styles.tabText, activeTab === "projects" && styles.activeTabText]}
          >
            Proyectos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "publications" && styles.activeTab]}
          onPress={() => setActiveTab("publications")}
        >
          <Text 
            style={[styles.tabText, activeTab === "publications" && styles.activeTabText]}
          >
            Publicaciones
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009245" />
          <Text style={styles.loadingText}>
            Cargando {activeTab === "projects" ? "proyectos" : "publicaciones"}...
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === "projects" ? projects : publications}
          renderItem={activeTab === "projects" ? renderProject : renderPublication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyListComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#009245"]}
              tintColor="#009245"
            />
          }
        />
      )}
      
      {renderDetailModal()}
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
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
  },
  addItemButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#009245",
  },
  tabText: {
    fontSize: wp("4%"),
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#009245",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: wp("4%"),
    color: "#666666",
    marginTop: hp("2%"),
  },
  listContainer: {
    padding: wp("4%"),
    paddingBottom: hp("5%"),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: hp("20%"),
    resizeMode: "cover",
  },
  cardContent: {
    padding: wp("4%"),
  },
  propertyTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#333333",
    marginBottom: hp("1%"),
  },
  propertyDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp("1%"),
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp("4%"),
    marginBottom: hp("0.5%"),
  },
  smallIconContainer: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  propertyType: {
    fontSize: wp("3.5%"),
    color: "#333333",
    marginLeft: wp("1%"),
  },
  propertyStatus: {
    fontSize: wp("3.5%"),
    color: "#333333",
    marginLeft: wp("1%"),
  },
  operationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  operationInfo: {
    flex: 1,
  },
  operationType: {
    fontSize: wp("3.8%"),
    fontWeight: "500",
    color: "#333333",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  address: {
    fontSize: wp("3.5%"),
    color: "#333333",
    marginLeft: wp("1%"),
    flex: 1,
  },
  price: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#009245",
    marginBottom: hp("1%"),
  },
  descriptionContainer: {
    marginBottom: hp("1.5%"),
  },
  descriptionTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333333",
    marginBottom: hp("0.5%"),
  },
  description: {
    fontSize: wp("3.5%"),
    color: "#666666",
    lineHeight: hp("2%"),
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: hp("1.5%"),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 50,
    backgroundColor: "#F0F9F1",
    width: "48%",
  },
  deleteButton: {
    backgroundColor: "#FEF0F0",
  },
  actionButtonText: {
    fontSize: wp("3.5%"),
    fontWeight: "500",
    color: "#009245",
    marginLeft: wp("1%"),
  },
  deleteButtonText: {
    color: "#FF3B30",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("10%"),
  },
  emptyText: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
    marginTop: hp("2%"),
  },
  emptySubText: {
    fontSize: wp("4%"),
    color: "#666666",
    textAlign: "center",
    marginTop: hp("1%"),
    marginBottom: hp("3%"),
  },
  addButton: {
    backgroundColor: "#009245",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("6%"),
    borderRadius: 25,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  
  // Estilos para el modal de detalle
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
    marginLeft: wp("3%"),
  },
  detailContainer: {
    flex: 1,
  },
  detailImage: {
    width: "100%",
    height: hp("30%"),
    resizeMode: "cover",
  },
  detailContent: {
    flex: 1,
    padding: wp("5%"),
  },
  detailTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#333333",
    marginBottom: hp("1.5%"),
  },
  detailInfo: {
    marginBottom: hp("2%"),
  },
  detailInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  detailInfoText: {
    fontSize: wp("4%"),
    color: "#333333",
    marginLeft: wp("2%"),
  },
  detailOperationInfo: {
    marginBottom: hp("1.5%"),
  },
  detailOperationType: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#333333",
    marginBottom: hp("0.5%"),
  },
  detailOperationStatus: {
    fontSize: wp("4%"),
    color: "#666666",
  },
  addressDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  addressDetail: {
    fontSize: wp("4%"),
    color: "#333333",
    marginLeft: wp("2%"),
    flex: 1,
  },
  detailPrice: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#009245",
    marginBottom: hp("2%"),
  },
  descriptionDetailContainer: {
    marginBottom: hp("2.5%"),
  },
  descriptionDetailTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#333333",
    marginBottom: hp("1%"),
  },
  descriptionDetail: {
    fontSize: wp("4%"),
    color: "#666666",
    lineHeight: hp("2.5%"),
  },
  detailButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: hp("2%"),
  },
  editDetailButton: {
    backgroundColor: "#009245",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: wp("2%"),
  },
  editDetailButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  deleteDetailButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
  },
  deleteDetailButtonText: {
    color: "#FF3B30",
    fontSize: wp("4%"),
    fontWeight: "500",
  },
});