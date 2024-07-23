import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { database } from '../../utils/firebase';
import CommonStyles from '../../utils/CommonStyles';



export default function Add() {
  // Estado para los interruptores
  const [isBodega, setIsBodega] = useState(false);
  const [isSalaDeEstar, setIsSalaDeEstar] = useState(false);
  const [isEstacionamiento, setIsEstacionamiento] = useState(false);
  const [isPiscina, setIsPiscina] = useState(false);
  const [isCondominio, setIsCondominio] = useState(false);
  const [isQuincho, setIsQuincho] = useState(false);
  const [isCalefaccion, setIsCalefaccion] = useState(false);
  const [isConserje, setIsConserje] = useState(false);
  const [isAscensor, setIsAscensor] = useState(false);
  const [isMascotas, setIsMascotas] = useState(false);
  const [isBasketball, setIsBasketball] = useState(false);
  const [isGym, setIsGym] = useState(false);
  const [isTennis, setIsTennis] = useState(false);
  const [isSoccer, setIsSoccer] = useState(false);
  const [isPaddle, setIsPaddle] = useState(false);
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [isMultiSport, setIsMultiSport] = useState(false);
  const [isParty, setIsParty] = useState(false);
  const [isSauna, setIsSauna] = useState(false);
  const [isBalcony, setIsBalcony] = useState(false);
  const [isJacuzzi, setIsJacuzzi] = useState(false);
  const [isTerrace, setIsTerrace] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState('');
  const [propertyCondition, setPropertyCondition] = useState('');
  const [propertyDepartment, setPropertyDepartment] = useState('');
  const [propertyOrientation, setPropertyOrientation] = useState('');

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
      <Text style={CommonStyles.header}>Crear Departemento</Text>

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

      <Text style={CommonStyles.formLabel}>Habitaciones</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min." />
      </View>

      <Text style={CommonStyles.formLabel}>Baños</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min." />
      </View>

      <Text style={CommonStyles.formLabel}>Superficie total</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min. m²" />
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max. m²" />
      </View>

      <Text style={CommonStyles.formLabel}>Superficie util</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min. m²" />
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max. m²" />
      </View>
      
      <Text style={CommonStyles.formLabel}>Superficie terraza</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginRight: 5 }]} placeholder="Min. m²" />
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max. m²" />
      </View>

      <Text style={CommonStyles.formLabel}>Cantidad maxima de habitantes</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]} placeholder="Max" />
      </View>

      <Text style={CommonStyles.formLabel}>Número de torre</Text>
      <TextInput style={CommonStyles.input} placeholder="" />

      <Text style={CommonStyles.formLabel}>Número de piso de la unidad</Text>
      <TextInput style={CommonStyles.input} placeholder="" />

      <Text style={CommonStyles.formLabel}>Departamentos por piso</Text>
      <TextInput style={CommonStyles.input} placeholder="" />

      <Text style={CommonStyles.formLabel}>Antigüedad</Text>
      <TextInput style={CommonStyles.input} placeholder="Años" />

      

      <Text style={CommonStyles.formLabel}>Tipo de departamento</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton('Semipiso', 'semipiso', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Triplex', 'triplex', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Loft', 'loft', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Penthouse', 'penthouse', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Departamento', 'departamento', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Duplex', 'duplex', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Monoambiente', 'monoambiente', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Ph', 'ph', propertyDepartment, setPropertyDepartment)}
        {renderOptionButton('Piso', 'psi', propertyDepartment, setPropertyDepartment)}
      </View>

      <Text style={CommonStyles.formLabel}>Orientación</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton('NO', 'no', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('NP', 'np', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('SO', 'so', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('SP', 'sp', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('NOSP', 'nosp', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('S', 's', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('P', 'p', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('N', 'n', propertyOrientation, setPropertyOrientation)}
        {renderOptionButton('O', 'o', propertyOrientation, setPropertyOrientation)}
      </View>

      <Text style={CommonStyles.formLabel}>Bodega</Text>
      <Switch value={isBodega} onValueChange={setIsBodega} />
      <TextInput style={CommonStyles.input} placeholder="Indique cuantas" />

      <Text style={CommonStyles.formLabel}>Sala de estar</Text>
      <Switch value={isSalaDeEstar} onValueChange={setIsSalaDeEstar} />

      <Text style={CommonStyles.formLabel}>Estacionamiento</Text>
      <Switch value={isEstacionamiento} onValueChange={setIsEstacionamiento} />
      <TextInput style={CommonStyles.input} placeholder="Indique cuantos" />

      <Text style={CommonStyles.formLabel}>Piscina</Text>
      <Switch value={isPiscina} onValueChange={setIsPiscina} />

      <Text style={CommonStyles.formLabel}>Condominio</Text>
      <Switch value={isCondominio} onValueChange={setIsCondominio} />

      <Text style={CommonStyles.formLabel}>Quincho</Text>
      <Switch value={isQuincho} onValueChange={setIsQuincho} />

      <Text style={CommonStyles.formLabel}>Calefacción</Text>
      <Switch value={isCalefaccion} onValueChange={setIsCalefaccion} />

      <Text style={CommonStyles.formLabel}>Conserje</Text>
      <Switch value={isConserje} onValueChange={setIsConserje} />

      <Text style={CommonStyles.formLabel}>Ascensor</Text>
      <Switch value={isAscensor} onValueChange={setIsAscensor} />

      <Text style={CommonStyles.formLabel}>Gimnasio</Text>
      <Switch value={isGym} onValueChange={setIsGym} />

      <Text style={CommonStyles.formLabel}>Basquetbol</Text>
      <Switch value={isBasketball} onValueChange={setIsBasketball} />
      
      <Text style={CommonStyles.formLabel}>Tenis</Text>
      <Switch value={isTennis} onValueChange={setIsTennis} />

      <Text style={CommonStyles.formLabel}>Futbol</Text>
      <Switch value={isSoccer} onValueChange={setIsSoccer} />

      <Text style={CommonStyles.formLabel}>Paddle</Text>
      <Switch value={isPaddle} onValueChange={setIsPaddle} />

      <Text style={CommonStyles.formLabel}>Multicancha</Text>
      <Switch value={isMultiSport} onValueChange={setIsMultiSport} />

      <Text style={CommonStyles.formLabel}>Terraza</Text>
      <Switch value={isTerrace} onValueChange={setIsTerrace} />

      <Text style={CommonStyles.formLabel}>Jacuzzi</Text>
      <Switch value={isJacuzzi} onValueChange={setIsJacuzzi} />

      <Text style={CommonStyles.formLabel}>Salon de fiestas</Text>
      <Switch value={isParty} onValueChange={setIsParty} />

      <Text style={CommonStyles.formLabel}>Balcón</Text>
      <Switch value={isBalcony} onValueChange={setIsBalcony} />

      <Text style={CommonStyles.formLabel}>Area verde</Text>
      <Switch value={isGreenArea} onValueChange={setIsGreenArea} />

      <Text style={CommonStyles.formLabel}>Sauna</Text>
      <Switch value={isSauna} onValueChange={setIsSauna} />

      <Text style={CommonStyles.formLabel}>Ascensor</Text>
      <Switch value={isAscensor} onValueChange={setIsAscensor} />

      <Text style={CommonStyles.formLabel}>¿Se permiten mascotas?</Text>
      <Switch value={isMascotas} onValueChange={setIsMascotas} />

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
