import React, { useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Image,
  ImageBackground,
} from "react-native";
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
    <View>
      {/* ----------------------------------------- */}
      <ImageBackground
        source={require("../../../assets/images/Group.png")}
        style={styles.backgorundImage}
      >
        <TouchableOpacity
          style={styles.homebutton}
          onPress={() => navigation.navigate("Home")}
        ></TouchableOpacity>

        <Image
          source={require("../../../assets/images/INMOBINDER-03.png")}
          style={styles.log}
        />

        <View style={CommonStyles.continer2}>
          <Text style={CommonStyles.header2}>
            Selecciona el tipo de proyecto{" "}
          </Text>
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
      </ImageBackground>
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
    <View style={styles.backgorundImage}>
      {selectedPropertyType ? renderForm() : renderPropertyTypeOptions()}
    </View>
  );
};
const styles = StyleSheet.create({
  homebutton: {
    width: 40, // Ajusta el ancho de la imagen
    height: 40, // Ajusta la altura de la image
    position: "absolute",
    margin: 1,
    top: -120,

    backgroundColor: "#D7DBDD",
  },

  backgorundImage: {
    width: "100%",
    height: "100%",
    marginTop: 85,
    resizeMode: "cover",
  },
  log: {
    width: 200, // Ajusta el ancho de la imagen
    height: 100, // Ajusta la altura de la imagen
    resizeMode: "contain", // Esto asegura que la imagen se escale proporcionalmente
    position: "absolute",
    top: -120,
    left: 100,
  },
});

export default AddProject;
