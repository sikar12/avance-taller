import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { database } from '../../utils/firebase';
import CommonStyles from '../../utils/CommonStyles';
import DepartmentForm from './DepartmentForm';
import HouseForm from './HouseForm';
import PlotForm from './PlotForm';
import ParkingForm from './ParkingForm';
import OfficeForm from './OfficeForm';
import WarehouseForm from './WarehouseForm';

const AddProject = ({ navigation }) => {
  const [propertyData, setPropertyData] = useState({});
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);

  const handleInputChange = (name, value) => {
    setPropertyData({ ...propertyData, [name]: value });
  };

  const onSubmit = async () => {
    const address = `${propertyData.street} ${propertyData.number}, ${propertyData.commune}, ${propertyData.region}`;
    await addDoc(collection(database, "properties"), {
      ...propertyData,
      address,
    });
    navigation.goBack();
  };

  const renderOptionButton = (label, value, currentValue, setValue) => (
    <TouchableOpacity
      style={[
        CommonStyles.optionButton,
        currentValue === value && CommonStyles.selectedOptionButton,
      ]}
      onPress={() => setValue(value)}
    >
      <Text
        style={[
          CommonStyles.optionButtonText,
          currentValue === value && CommonStyles.selectedOptionButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPropertyTypeOptions = () => (
    <View style={CommonStyles.optionsContainer}>
      {renderOptionButton("Añadir Departamento", "department", selectedPropertyType, setSelectedPropertyType)}
      {renderOptionButton("Añadir Casa", "house", selectedPropertyType, setSelectedPropertyType)}
      {renderOptionButton("Añadir Parcela", "plot", selectedPropertyType, setSelectedPropertyType)}
      {renderOptionButton("Añadir Estacionamiento", "parking", selectedPropertyType, setSelectedPropertyType)}
      {renderOptionButton("Añadir Oficina", "office", selectedPropertyType, setSelectedPropertyType)}
      {renderOptionButton("Añadir Bodega", "warehouse", selectedPropertyType, setSelectedPropertyType)}
    </View>
  );

  const renderForm = () => {
    switch (selectedPropertyType) {
      case "department":
        return <DepartmentForm />;
      case "house":
        return <HouseForm />;
      case "plot":
        return <PlotForm />;
      case "parking":
        return <ParkingForm />;
      case "office":
        return <OfficeForm />;
      case "warehouse":
        return <WarehouseForm />;
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={CommonStyles.container}
      contentContainerStyle={CommonStyles.scrollContainer}
    >
      {selectedPropertyType ? renderForm() : renderPropertyTypeOptions()}
    </ScrollView>
  );
};

export default AddProject;

