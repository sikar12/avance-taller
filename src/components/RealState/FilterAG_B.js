import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const FilterAG_B = ({ onClose, onApplyFilters, initialFilters }) => {
  // Estados para los filtros
  const [tipoPropiedad, setTipoPropiedad] = useState(initialFilters?.tipoPropiedad || "Todos");
  const [operacion, setOperacion] = useState(initialFilters?.operacion || "Todos");
  const [estadoPropiedad, setEstadoPropiedad] = useState(initialFilters?.estadoPropiedad || "Todos");
  const [precioMin, setPrecioMin] = useState(initialFilters?.precioMin?.toString() || "");
  const [precioMax, setPrecioMax] = useState(initialFilters?.precioMax?.toString() || "");
  const [habitaciones, setHabitaciones] = useState(initialFilters?.habitaciones?.toString() || "");
  const [banos, setBanos] = useState(initialFilters?.banos?.toString() || "");
  const [mostrarPublicaciones, setMostrarPublicaciones] = useState(
    initialFilters?.mostrarPublicaciones !== undefined ? initialFilters.mostrarPublicaciones : true
  );
  
  // Tipos de propiedad disponibles
  const tiposPropiedad = ["Todos", "Casa", "Departamento", "Terreno", "Oficina", "Local", "Bodega"];
  
  // Tipos de operación
  const tiposOperacion = ["Todos", "Venta", "Arriendo", "Arriendo y Venta"];
  
  // Estados de propiedad
  const estadosPropiedades = ["Todos", "Nuevo", "Usado"];
  
  // Función para aplicar los filtros
  const aplicarFiltros = () => {
    const filtros = {
      // Filtros de propiedades
      tipoPropiedad: tipoPropiedad === "Todos" ? null : tipoPropiedad,
      operacion: operacion === "Todos" ? null : operacion,
      estadoPropiedad: estadoPropiedad === "Todos" ? null : estadoPropiedad,
      precioMin: precioMin ? parseInt(precioMin) : null,
      precioMax: precioMax ? parseInt(precioMax) : null,
      habitaciones: habitaciones ? parseInt(habitaciones) : null,
      banos: banos ? parseInt(banos) : null,
      
      // Visibilidad
      mostrarPublicaciones
    };
    
    onApplyFilters(filtros);
    onClose();
  };
  
  const limpiarFiltros = () => {
    setTipoPropiedad("Todos");
    setOperacion("Todos");
    setEstadoPropiedad("Todos");
    setPrecioMin("");
    setPrecioMax("");
    setHabitaciones("");
    setBanos("");
    setMostrarPublicaciones(true);
  };
  
  // Función para formatear valores de precio (separador de miles)
  const formatearPrecio = (valor) => {
    if (!valor) return "";
    // Eliminar caracteres no numéricos
    const numero = valor.replace(/\D/g, '');
    // Formatear con separador de miles
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Función para procesar entrada de precio
  const procesarPrecio = (valor, setterFuncion) => {
    // Guardar el valor sin formato para el estado
    const valorLimpio = valor.replace(/\D/g, '');
    setterFuncion(valorLimpio);
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Filtrar Propiedades</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Mostrar propiedades en el mapa */}
            <View style={styles.formSection}>
              <View style={styles.switchContainer}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Mostrar propiedades en el mapa</Text>
                  <Switch
                    value={mostrarPublicaciones}
                    onValueChange={setMostrarPublicaciones}
                    trackColor={{ false: "#d8d8d8", true: "#c5e1c5" }}
                    thumbColor={mostrarPublicaciones ? "green" : "#f4f3f4"}
                  />
                </View>
              </View>
            </View>
            
            {/* Tipo de propiedad */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Tipo de Propiedad</Text>
              <View style={styles.optionsContainer}>
                {tiposPropiedad.map((tipo) => (
                  <TouchableOpacity 
                    key={tipo}
                    style={[
                      styles.optionButton,
                      tipoPropiedad === tipo && styles.optionButtonSelected
                    ]}
                    onPress={() => setTipoPropiedad(tipo)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      tipoPropiedad === tipo && styles.optionButtonTextSelected
                    ]}>
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Tipo de operación */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Operación</Text>
              <View style={styles.optionsContainer}>
                {tiposOperacion.map((tipo) => (
                  <TouchableOpacity 
                    key={tipo}
                    style={[
                      styles.optionButton,
                      operacion === tipo && styles.optionButtonSelected
                    ]}
                    onPress={() => setOperacion(tipo)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      operacion === tipo && styles.optionButtonTextSelected
                    ]}>
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Estado de la propiedad */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Estado de la propiedad</Text>
              <View style={styles.optionsContainer}>
                {estadosPropiedades.map((estado) => (
                  <TouchableOpacity 
                    key={estado}
                    style={[
                      styles.optionButton,
                      estadoPropiedad === estado && styles.optionButtonSelected
                    ]}
                    onPress={() => setEstadoPropiedad(estado)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      estadoPropiedad === estado && styles.optionButtonTextSelected
                    ]}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Rango de precios */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Rango de Precio (CLP)</Text>
              <View style={styles.doubleInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Desde</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$ Mínimo"
                    value={precioMin ? formatearPrecio(precioMin) : ""}
                    onChangeText={(text) => procesarPrecio(text, setPrecioMin)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Hasta</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$ Máximo"
                    value={precioMax ? formatearPrecio(precioMax) : ""}
                    onChangeText={(text) => procesarPrecio(text, setPrecioMax)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            {/* Habitaciones y baños */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Características</Text>
              <View style={styles.doubleInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Habitaciones</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. habitaciones"
                    value={habitaciones}
                    onChangeText={setHabitaciones}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Baños</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. baños"
                    value={banos}
                    onChangeText={setBanos}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={aplicarFiltros}>
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    height: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  optionButtonText: {
    color: '#666',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '30%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default FilterAG_B;