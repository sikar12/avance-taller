import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import CommonStyles from "../../utils/CommonStyles";
import Icon from "react-native-vector-icons/Ionicons";

export default function Add() {
  // Estado para los interruptores
  const [isEstacionamiento, setIsEstacionamiento] = useState(false);
  const [isCalefaccion, setIsCalefaccion] = useState(false);
  const [isAscensor, setIsAscensor] = useState(false);
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [propertyOrientation, setPropertyOrientation] = useState("");

  const [propertyData, setPropertyData] = useState({
    street: "",
    number: "",
    commune: "",
    region: "",
    description: "",
    priceMin: "",
    priceMax: "",
    surfaceTotalMin: "",
    surfaceTotalMax: "",
    surfaceUtilMin: "",
    surfaceUtilMax: "",
    towerNumber: "",
    floorNumber: "",
    antiquity: "",
    additionalFeature: "",
    isEstacionamiento: false,
    isCalefaccion: false,
    isAscensor: false,
    isGreenArea: false,
    propertyStatus: "",
    propertyCondition: "",
    propertyOrientation: ""
  });

  const navigation = useNavigation();

  const handleInputChange = (field, value) => {
    setPropertyData({ ...propertyData, [field]: value });
  };

  const onSubmit = async () => {
    try {
      await addDoc(collection(db, "properties"),{
        propertyData,
        propertyStatus,
        propertyCondition,
        propertyOrientation,
      });
      Alert.alert("Propiedad creada exitosamente");
      navigation.goBack();
    } catch (error) {
      console.log("Error al crear la propiedad:", error);
      Alert.alert("Error al crear la propiedad");
    }
  };

  const renderOptionButton = (label, value, currentValue, setValue) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        currentValue === value && styles.selectedOptionButton,
      ]}
      onPress={() => setValue(value)}
    >
      <Text
        style={[
          styles.optionButtonText,
          currentValue === value && styles.selectedOptionButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../../assets/images/Group.png")}
      style={styles.backgorundImage}
    >
      <View style={styles.homebutton}>
        <Button
          title="◀"
          onPress={() => navigation.navigate("Home")}
          color="black"
        />
        <Image
          style={styles.logo}
          source={require("../../../assets/images/INMOBINDER-03.png")}
        />
      </View>

      <View style={styles.container}>
        <Text style={CommonStyles.header2}>Crear Bodega</Text>
        <ScrollView
          style={CommonStyles.container}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={CommonStyles.formLabel}>Propiedad en</Text>
          <View style={styles.optionButtonContainer}>
            {renderOptionButton(
              "Arriendo",
              "arriendo",
              propertyStatus,
              setPropertyStatus
            )}
            {renderOptionButton(
              "Arriendo temporal",
              "arriendoTemporal",
              propertyStatus,
              setPropertyStatus
            )}
            {renderOptionButton(
              "Venta",
              "venta",
              propertyStatus,
              setPropertyStatus
            )}
          </View>

          <Text style={CommonStyles.formLabel}>Estado propiedad</Text>
          <View style={styles.optionButtonContainer}>
            {renderOptionButton(
              "Terminado",
              "terminado",
              propertyCondition,
              setPropertyCondition
            )}
            {renderOptionButton(
              "En construcción",
              "en construcción",
              propertyCondition,
              setPropertyCondition
            )}
            {renderOptionButton(
              "Suspendido",
              "suspendido",
              propertyCondition,
              setPropertyCondition
            )}
          </View>

          <Text style={CommonStyles.formLabel}>Región</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese región"
            value={propertyData.region}
            onChangeText={(text) => handleInputChange("region", text)}
          />

          <Text style={CommonStyles.formLabel}>Comuna</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese comuna"
            value={propertyData.commune}
            onChangeText={(text) => handleInputChange("commune", text)}
          />

          <Text style={CommonStyles.formLabel}>Calle</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese Calle"
            value={propertyData.street}
            onChangeText={(text) => handleInputChange("street", text)}
          />

          <Text style={CommonStyles.formLabel}>Número</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese número"
            value={propertyData.number}
            onChangeText={(text) => handleInputChange("number", text)}
          />

          <Text style={CommonStyles.formLabel}>Descripción</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese descripción"
            value={propertyData.description}
            onChangeText={(text) => handleInputChange("description", text)}
          />
          <Text style={CommonStyles.formLabel}>Precio</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min."
              value={propertyData.priceMin}
              onChangeText={(text) => handleInputChange("priceMin", text)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max."
              value={propertyData.priceMax}
              onChangeText={(text) => handleInputChange("priceMax", text)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie total</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min. m²"
              value={propertyData.surfaceTotalMin}
              onChangeText={(text) => handleInputChange("surfaceTotalMin", text)}
            />

            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max. m²"
              value={propertyData.surfaceTotalMax}
              onChangeText={(text) => handleInputChange("surfaceTotalMax", text)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie util</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min. m²"
              value={propertyData.surfaceUtilMin}
              onChangeText={(text) => handleInputChange("surfaceUtilMin", text)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max. m²"
              value={propertyData.surfaceUtilMax}
              onChangeText={(text) => handleInputChange("surfaceUtilMax", text)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Número de torre</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Número de Torre"
            value={propertyData.towerNumber}
            onChangeText={(text) => handleInputChange("towerNumber", text)}
          />

          <Text style={CommonStyles.formLabel}>Número de piso de la unidad</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Número de Piso"
            value={propertyData.floorNumber}
            onChangeText={(text) => handleInputChange("floorNumber", text)}
          />

          <Text style={CommonStyles.formLabel}>Antigüedad</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Antigüedad"
            value={propertyData.antiquity}
            onChangeText={(text) => handleInputChange("antiquity", text)}
          />

<Text style={CommonStyles.formLabel}>Orientación</Text>
          <View style={styles.optionButtonContainer}>
            {renderOptionButton(
              "NO",
              "no",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "NP",
              "np",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "SO",
              "so",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "SP",
              "sp",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "NOSP",
              "nosp",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "S",
              "s",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "P",
              "p",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "N",
              "n",
              propertyOrientation,
              setPropertyOrientation
            )}
            {renderOptionButton(
              "O",
              "o",
              propertyOrientation,
              setPropertyOrientation
            )}
          </View>


          <Text style={CommonStyles.formLabel}>Estacionamiento</Text>
          <Switch
            value={isEstacionamiento}
            onValueChange={(value) => {
              setIsEstacionamiento(value);
              handleInputChange("isEstacionamiento", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Calefacción</Text>
          <Switch
            value={isCalefaccion}
            onValueChange={(value) => {
              setIsCalefaccion(value);
              handleInputChange("isCalefaccion", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Ascensor</Text>
          <Switch
            value={isAscensor}
            onValueChange={(value) => {
              setIsAscensor(value);
              handleInputChange("isAscensor", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Áreas verdes</Text>
          <Switch
            value={isGreenArea}
            onValueChange={(value) => {
              setIsGreenArea(value);
              handleInputChange("isGreenArea", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Características adicionales</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Características adicionales"
            value={propertyData.additionalFeature}
            onChangeText={(text) => handleInputChange("additionalFeature", text)}
          />

          <TouchableOpacity style={CommonStyles.button}>
            <Text style={CommonStyles.buttonText}>Editar fotografías</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={CommonStyles.button}
            onPress={() => onSubmit()}
          >
            <Text style={CommonStyles.buttonText}>Aplicar cambios</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  optionButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 5,
  },
  selectedOptionButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  optionButtonText: {
    color: "#000",
  },
  selectedOptionButtonText: {
    color: "#fff",
  },
  image: {
    width: 60, // Ajusta el ancho de la imagen
    height: 50, // Ajusta la altura de la imagen
    resizeMode: "contain", // Esto asegura que la imagen se escale proporcionalmente
  },
  backgorundImage: {
    width: "100%",
    height: "100%",
    marginTop: 85,
    resizeMode: "cover",
  },
  homebutton: {
    width: "15%", // Ajusta el ancho de la imagen
    height: "5%", // Ajusta la altura de la image
    top: -120,
    left: 10,
    Radius: 50,
    borderRadius: 50,
  },
  container: {
    position: "center",
    padding: 20,
    backgroundColor: "#fff",
    margin: 20,
    marginTop: "100px",
    borderRadius: 30,
    marginBottom: 1,
    height: "70%",
  },
  imagecontiner: {
    backgroundColor: "#D7DBDD",
  },
  logo: {
    top: "-10%",
    left: "225%",
  },
});

