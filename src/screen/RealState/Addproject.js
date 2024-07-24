import React, { useState } from "react";
import { ScrollView, View, TouchableOpacity, Text, Image } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { database } from "../../utils/firebase";
import CommonStyles from "../../utils/CommonStyles";
import DepartmentForm from "./DepartmentForm";
import HouseForm from "./HouseForm";
import PlotForm from "./PlotForm";
import ParkingForm from "./ParkingForm";
import OfficeForm from "./OfficeForm";
import WarehouseForm from "./WarehouseForm";
import { StyleSheet } from "react-native";

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
    <View style={CommonStyles.container}>
      <Text style={CommonStyles.header}>Selecciona el tipo de proyecto </Text>

      <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate("Home")}
      >
        <Image
          source={require("../../../assets/images/volver.png")}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Departamento",
          "department",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Casa",
          "house",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Parcela",
          "plot",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Estacionamiento",
          "parking",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Oficina",
          "office",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
      <View style={CommonStyles.button}>
        {renderOptionButton(
          "Añadir Bodega",
          "warehouse",
          selectedPropertyType,
          setSelectedPropertyType
        )}
      </View>
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
const styles = StyleSheet.create({
  image: {
    width: 60, // Ajusta el ancho de la imagen
    height: 50, // Ajusta la altura de la imagen
    resizeMode: "contain", // Esto asegura que la imagen se escale proporcionalmente
  },
});

export default AddProject;
