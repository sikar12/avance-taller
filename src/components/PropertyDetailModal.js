// PropertyDetailModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const PropertyDetailModal = ({ visible, onClose, property, type }) => {
  // Si no hay propiedad, no mostrar nada
  if (!property) return null;
  
  // Función para formatear precio - CORREGIDA
  const formatPrice = (min, max) => {
    // Verificar que los valores sean números válidos
    const validMin = typeof min === 'number' && !isNaN(min);
    const validMax = typeof max === 'number' && !isNaN(max);
    
    if (!validMin && !validMax) return "Precio a convenir";
    if (!validMin) return `$${max.toLocaleString()} CLP`;
    if (!validMax) return `$${min.toLocaleString()} CLP`;
    return `$${min.toLocaleString()} CLP`;
  };

  // Renderizado específico para publicaciones
  const renderPublicationDetails = () => (
    <>
      <Text style={styles.propertyTitle}>
        {property.tipoPropiedad || 'Propiedad'} en {property.operacion || 'Venta/Arriendo'}
      </Text>
      <Text style={styles.propertyPrice}>
        {formatPrice(property.precioMin, property.precioMax)}
      </Text>
      <Text style={styles.propertyAddress}>{property.direccion || 'Dirección no disponible'}</Text>
      
      {/* Sección de características principales */}
      <View style={styles.featuresContainer}>
        {property.habitaciones !== undefined && property.habitaciones !== null && (
          <View style={styles.featureItem}>
            <Ionicons name="bed-outline" size={22} color="#444" />
            <Text style={styles.featureText}>{property.habitaciones} Hab.</Text>
          </View>
        )}
        
        {property.banos !== undefined && property.banos !== null && (
          <View style={styles.featureItem}>
            <Ionicons name="water-outline" size={22} color="#444" />
            <Text style={styles.featureText}>{property.banos} Baños</Text>
          </View>
        )}
        
        {property.superficieTotal !== undefined && property.superficieTotal !== null && (
          <View style={styles.featureItem}>
            <Ionicons name="resize-outline" size={22} color="#444" />
            <Text style={styles.featureText}>{property.superficieTotal} m²</Text>
          </View>
        )}
        
        {property.estacionamientos !== undefined && property.estacionamientos !== null && (
          <View style={styles.featureItem}>
            <Ionicons name="car-outline" size={22} color="#444" />
            <Text style={styles.featureText}>{property.estacionamientos} Est.</Text>
          </View>
        )}
      </View>
      
      {/* Estado de la propiedad */}
      {property.estado && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateLabel}>Estado:</Text>
          <Text style={styles.stateValue}>{property.estado}</Text>
        </View>
      )}
      
      {/* Descripción */}
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.descriptionText}>{property.descripcion || "Sin descripción disponible"}</Text>
      
      {/* Amenidades si existen */}
      {Array.isArray(property.amenidades) && property.amenidades.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Amenidades</Text>
          <View style={styles.amenitiesContainer}>
            {property.amenidades.map((amenidad, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={18} color="green" />
                <Text style={styles.amenityText}>{amenidad}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );

  // Renderizado específico para proyectos
  const renderProjectDetails = () => (
    <>
      <Text style={styles.projectTitle}>
        {property.nombreProyecto || "Proyecto"}
      </Text>
      <Text style={styles.projectType}>
        {property.tipoProyecto || "Sin tipo definido"}
      </Text>
      <Text style={styles.propertyPrice}>
        {typeof property.precioDesde === 'number' ? 
          `Desde ${formatPrice(property.precioDesde, 0)}` : 
          "Consultar precio"}
      </Text>
      <Text style={styles.propertyAddress}>{property.direccion || 'Dirección no disponible'}</Text>
      
      {/* Estado del proyecto */}
      {property.estadoProyecto && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateLabel}>Estado del proyecto:</Text>
          <Text style={styles.stateValue}>{property.estadoProyecto}</Text>
        </View>
      )}
      
      {/* Fecha estimada de entrega */}
      {property.fechaEntrega && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateLabel}>Entrega estimada:</Text>
          <Text style={styles.stateValue}>{property.fechaEntrega}</Text>
        </View>
      )}
      
      {/* Descripción */}
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.descriptionText}>{property.descripcion || "Sin descripción disponible"}</Text>
      
      {/* Tipos de unidades disponibles */}
      {Array.isArray(property.tiposDisponibles) && property.tiposDisponibles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tipos disponibles</Text>
          <View style={styles.typesContainer}>
            {property.tiposDisponibles.map((tipo, index) => (
              <View key={index} style={styles.typeItem}>
                <Text style={styles.typeName}>{tipo.nombre || 'Tipo ' + (index + 1)}</Text>
                {tipo.precio && <Text style={styles.typePrice}>Desde ${tipo.precio.toLocaleString()} CLP</Text>}
                {tipo.superficie && <Text style={styles.typeDetail}>{tipo.superficie} m²</Text>}
                {tipo.habitaciones && <Text style={styles.typeDetail}>{tipo.habitaciones} Hab.</Text>}
                {tipo.banos && <Text style={styles.typeDetail}>{tipo.banos} Baños</Text>}
              </View>
            ))}
          </View>
        </>
      )}
      
      {/* Amenidades del proyecto */}
      {Array.isArray(property.amenidades) && property.amenidades.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Amenidades</Text>
          <View style={styles.amenitiesContainer}>
            {property.amenidades.map((amenidad, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={18} color="green" />
                <Text style={styles.amenityText}>{amenidad}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Botón para cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Portada o Imagen representativa */}
          <View style={styles.imageContainer}>
            {property.imagenPortada ? (
              <Image 
                source={{ uri: property.imagenPortada }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons 
                  name={type === 'project' ? "business" : "home"} 
                  size={60} 
                  color="#ddd" 
                />
              </View>
            )}
          </View>
          
          {/* Contenido scrollable */}
          <ScrollView style={styles.scrollContainer}>
            {/* Renderizado condicional según tipo */}
            {type === 'project' ? renderProjectDetails() : renderPublicationDetails()}
            
            {/* Espacio adicional al final */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageContainer: {
    width: '100%',
    height: 220,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009245',
    marginBottom: 2,
  },
  projectType: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 5,
  },
  stateContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  stateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 5,
  },
  stateValue: {
    fontSize: 14,
    color: '#009245',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'justify'
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: '#f0f9f1',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  amenityText: {
    fontSize: 12,
    color: '#444',
    marginLeft: 5,
  },
  typesContainer: {
    marginBottom: 15,
  },
  typeItem: {
    backgroundColor: '#f0f9f1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  typePrice: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  typeDetail: {
    fontSize: 14,
    color: '#444',
  }
});

export default PropertyDetailModal;