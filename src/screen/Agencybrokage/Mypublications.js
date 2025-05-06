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

export default function MyPublications() {
  const navigation = useNavigation();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar publicaciones cuando el componente se monta o cuando vuelve a estar en foco
  useFocusEffect(
    React.useCallback(() => {
      loadPublications();
      return () => {}; // Función de limpieza opcional
    }, [])
  );

  const loadPublications = async () => {
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
      
      // CAMBIO: Consulta modificada para filtrar por userId y source
      const publicationsQuery = query(
        collection(db, "publicaciones"),
        where("userId", "==", user.uid),
        where("source", "==", "agencybrokage") // Filtrar por source
      );
      
      console.log("Ejecutando consulta para publicaciones de agencybrokage");
      const snapshot = await getDocs(publicationsQuery);
      
      console.log(`Documentos encontrados: ${snapshot.docs.length}`);
      
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date(),
      }));
      
      setPublications(publicationsData);
      console.log(`Publicaciones cargadas: ${publicationsData.length}`);
      
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las publicaciones: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPublications();
  };

  const handleEdit = (publication) => {
    navigation.navigate ("EditPublication", { publication: publication });
  };

  const handleDelete = async (publicationId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "publicaciones", publicationId));
      
      // Actualizar el estado local para eliminar la publicación
      setPublications(prevPublications => 
        prevPublications.filter(pub => pub.id !== publicationId)
      );
      
      Alert.alert("Éxito", "Publicación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      Alert.alert("Error", "No se pudo eliminar la publicación: " + error.message);
    }
  };

  const confirmDelete = (publication) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta publicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => handleDelete(publication.id)
        }
      ]
    );
  };

  const openPublicationDetail = (publication) => {
    setSelectedPublication(publication);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPublication(null);
  };

  const renderItem = ({ item }) => {
    // Formatear el precio para mostrar
    const formatPrice = (min, max) => {
      if (min === 0 && max === 0) return "Precio a convenir";
      if (min === 0) return `$${max.toLocaleString()} CLP`;
      if (max === 0) return `$${min.toLocaleString()} CLP`;
      return `$${min.toLocaleString()} CLP`;
    };
    
    // Obtener tipo de operación para mostrar
    const getOperationType = (operacion) => {
      if (operacion === "Venta") return "Propiedad en Venta";
      if (operacion === "Arriendo") return "Propiedad en Arriendo";
      return "Propiedad en Arriendo y Venta";
    };
    
    return (
      <TouchableOpacity 
        style={styles.publicationCard}
        onPress={() => openPublicationDetail(item)}
      >
        <Image 
          source={item.imagenUrl ? { uri: item.imagenUrl } : require("../../../assets/Perfil.png")} 
          style={styles.propertyImage}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.operationContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={20} color="#666" />
            </View>
            <View style={styles.operationInfo}>
              <Text style={styles.operationType}>{getOperationType(item.operacion)}</Text>
              <Text style={styles.price}>{formatPrice(item.precioMin, item.precioMax)}</Text>
              {/* <Text style={styles.subtitle}>UF 3.875</Text> */}
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
      <Ionicons name="home" size={80} color="#CCCCCC" />
      <Text style={styles.emptyText}>No tienes publicaciones</Text>
      <Text style={styles.emptySubText}>
        Las propiedades que publiques aparecerán aquí
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate("AddPublication")}
      >
        <Text style={styles.addButtonText}>Crear nueva publicación</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPublicationDetail = () => {
    if (!selectedPublication) return null;
    
    // Formatear el precio para mostrar
    const formatPrice = (min, max) => {
      if (min === 0 && max === 0) return "Precio a convenir";
      if (min === 0) return `$${max.toLocaleString()} CLP`;
      if (max === 0) return `$${min.toLocaleString()} CLP`;
      return `$${min.toLocaleString()} CLP`;
    };
    
    // Obtener tipo de operación para mostrar
    const getOperationType = (operacion) => {
      if (operacion === "Venta") return "Propiedad en Venta";
      if (operacion === "Arriendo") return "Propiedad en Arriendo";
      return "Propiedad en Arriendo y Venta";
    };
    
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
            <Text style={styles.modalTitle}>Publicación</Text>
          </View>
          
          <View style={styles.detailContainer}>
            <Image 
              source={
                selectedPublication.imagenUrl 
                ? { uri: selectedPublication.imagenUrl } 
                : require("../../../assets/Perfil.png")
              } 
              style={styles.detailImage}
            />
            
            <View style={styles.detailContent}>
              <View style={styles.operationContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="home" size={20} color="#666" />
                </View>
                <View style={styles.operationInfo}>
                  <Text style={styles.operationType}>
                    {getOperationType(selectedPublication.operacion)}
                  </Text>
                  <Text style={styles.detailPrice}>
                    {formatPrice(selectedPublication.precioMin, selectedPublication.precioMax)}
                  </Text>
                  {/* <Text style={styles.subtitle}>UF 3.875</Text> */}
                </View>
              </View>
              
              <View style={styles.addressContainer}>
                <Ionicons name="location" size={16} color="#FF3B30" />
                <Text style={styles.address}>
                  {selectedPublication.direccion || "Sin dirección especificada"}
                </Text>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Descripción</Text>
                <Text style={styles.description}>
                  {selectedPublication.descripcion || "No hay descripción disponible para esta propiedad."}
                </Text>
              </View>
              
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Características</Text>
                
                <View style={styles.featuresGrid}>
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="bed-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>3 dormitorios</Text>
                  </View> */}
                  
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="resize-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>72 m² construidos</Text>
                  </View> */}
                  
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="water-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>2 baños</Text>
                  </View> */}
                  
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="git-compare-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>90 m² totales</Text>
                  </View> */}
                  
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="car-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>Estacionamiento</Text>
                  </View> */}
                  
                  {/* <View style={styles.featureItem}>
                    <Ionicons name="business-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>2 pisos</Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Ionicons name="tv-outline" size={20} color="#666" />
                    <Text style={styles.featureText}>Sala de estar</Text>
                  </View> */}
                </View>
              </View>
              
              <View style={styles.advertiserContainer}>
                <Text style={styles.advertiserTitle}>Información anunciante</Text>
                
                <View style={styles.advertiserProfile}>
                  <View style={styles.advertiserImageContainer}>
                    <Image 
                      source={require("../../../assets/Perfil.png")} 
                      style={styles.advertiserImage}
                    />
                  </View>
                  <View style={styles.advertiserInfo}>
                    <Text style={styles.advertiserName}>John Doe</Text>
                    <View style={styles.advertiserContact}>
                      <Ionicons name="mail-outline" size={14} color="#666" />
                      <Text style={styles.advertiserContactText}>correo.anunciante@dominio.cl</Text>
                    </View>
                    <View style={styles.advertiserContact}>
                      <Ionicons name="call-outline" size={14} color="#666" />
                      <Text style={styles.advertiserContactText}>+56 9 3425 2345</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    closeModal();
                    handleEdit(selectedPublication);
                  }}
                >
                  <Text style={styles.editButtonText}>Editar publicación</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteDetailButton}
                  onPress={() => {
                    closeModal();
                    confirmDelete(selectedPublication);
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
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
        <TouchableOpacity 
          style={styles.addPublicationButton}
          onPress={() => navigation.navigate("AddPublication")}
        >
          <Ionicons name="add" size={24} color="#009245" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009245" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={publications}
          renderItem={renderItem}
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
      
      {renderPublicationDetail()}
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
  addPublicationButton: {
    padding: 5,
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
  publicationCard: {
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
  operationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  iconContainer: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  operationInfo: {
    flex: 1,
  },
  operationType: {
    fontSize: wp("3.8%"),
    fontWeight: "500",
    color: "#333333",
  },
  price: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#000000",
  },
  subtitle: {
    fontSize: wp("3.5%"),
    color: "#666666",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  address: {
    fontSize: wp("3.5%"),
    color: "#333333",
    marginLeft: wp("1%"),
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: hp("2%"),
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
  detailPrice: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#000000",
  },
  featuresContainer: {
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },
  featuresTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333333",
    marginBottom: hp("1%"),
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: hp("1%"),
  },
  featureText: {
    fontSize: wp("3.5%"),
    color: "#666666",
    marginLeft: wp("1%"),
  },
  advertiserContainer: {
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
  },
  advertiserTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333333",
    marginBottom: hp("1%"),
  },
  advertiserProfile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: wp("3%"),
    borderRadius: 10,
  },
  advertiserImageContainer: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
    overflow: "hidden",
  },
  advertiserImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  advertiserInfo: {
    flex: 1,
  },
  advertiserName: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333333",
    marginBottom: hp("0.5%"),
  },
  advertiserContact: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.5%"),
  },
  advertiserContactText: {
    fontSize: wp("3.2%"),
    color: "#666666",
    marginLeft: wp("1%"),
  },
  detailButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  editButton: {
    backgroundColor: "#009245",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: wp("2%"),
  },
  editButtonText: {
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