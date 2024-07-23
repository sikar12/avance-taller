import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { database } from '../../utils/firebase';
import CommonStyles from '../../utils/CommonStyles';



export default function Add() {
  // Estado para los interruptores
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState('');
  const [propertyCondition, setPropertyCondition] = useState('');

  const handleInputChange = (name, value) => {
    setPropertyData({ ...propertyData, [name]: value });
  };

  const onSubmit = async () => {
    const address = `${propertyData.street} ${propertyData.number}, ${propertyData.commune}, ${propertyData.region}`;
    await addDoc(collection(database, 'properties'), { ...propertyData, address });
    navigation.goBack();
  };

  const renderOptionButton = (label, value, currentValue, setValue) => (
    <TouchableOpacity
      style={[styles.optionButton, currentValue === value && styles.selectedOptionButton]}
      onPress={() => setValue(value)}
    >
      <Text style={[styles.optionButtonText, currentValue === value && styles.selectedOptionButtonText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={CommonStyles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={CommonStyles.header}>Crear Parcela</Text>

      <Text style={CommonStyles.formLabel}>Propiedad en</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton('Arriendo', 'arriendo', propertyStatus, setPropertyStatus)}
        {renderOptionButton('Arriendo temporal', 'arriendoTemporal', propertyStatus, setPropertyStatus)}
        {renderOptionButton('Venta', 'venta', propertyStatus, setPropertyStatus)}
      </View>

      <Text style={CommonStyles.formLabel}>Estado propiedad</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton('Terminado', 'terminado', propertyCondition, setPropertyCondition)}
        {renderOptionButton('En construcción', 'en construcción', propertyCondition, setPropertyCondition)}
        {renderOptionButton('Suspendido', 'suspendido', propertyCondition, setPropertyCondition)}
      </View>

      <Text style={CommonStyles.formLabel}>Dirección</Text>
      <TextInput style={CommonStyles.input} placeholder="Ingrese dirección" />

      <Text style={CommonStyles.formLabel}>Descripción</Text>
      <TextInput style={CommonStyles.input} placeholder="Ingrese descripción de la propiedad" />

      <Text style={CommonStyles.formLabel}>Precio</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min." />
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max." />
      </View>

      <Text style={CommonStyles.formLabel}>Superficie total</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min. m²" />
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max. m²" />
      </View>

      <Text style={CommonStyles.formLabel}>Antigüedad</Text>
      <TextInput style={CommonStyles.input} placeholder="Años" />

      <Text style={CommonStyles.formLabel}>Area verde</Text>
      <Switch value={isGreenArea} onValueChange={setIsGreenArea} />

      <Text style={CommonStyles.formLabel}>Otra</Text>
      <TextInput style={CommonStyles.input} placeholder="Ingrese característica adicional" />

      <TouchableOpacity style={CommonStyles.button}>
        <Text style={CommonStyles.buttonText}>Editar fotografías</Text>
      </TouchableOpacity>

      <TouchableOpacity style={CommonStyles.button}>
        <Text style={CommonStyles.buttonText}>Aplicar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  optionButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    color: '#000',
  },
  selectedOptionButtonText: {
    color: '#fff',
  },
});
