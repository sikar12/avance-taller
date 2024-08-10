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
import validateFields from "./FormValidations";
import regions from "../../utils/regions";
import { Picker } from "@react-native-picker/picker";
import ImagePickerComponent from './ImagePickerComponent';

export default function Add() {
  // Estado para los interruptores
  const [isEstacionamiento, setIsEstacionamiento] = useState(false);
  const [isCalefaccion, setIsCalefaccion] = useState(false);
  const [isAscensor, setIsAscensor] = useState(false);
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [propertyOrientation, setPropertyOrientation] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

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
    propertyOrientation: "",
  });

  const [formState, setFormState] = useState({
    priceMin: "",
    priceMax: "",
    bedroomMin: "",
    bedroomMax: "",
    bathroomMin: "",
    bathroomMax: "",
    surfaceTotalMin: "",
    surfaceTotalMax: "",
    surfaceUtilMin: "",
    surfaceTerraceMin: "",
    surfaceTerraceMax: "",
  });

  const [errors, setErrors] = useState({});

  const navigation = useNavigation();

  const handleInputChange = (field, value) => {
    const updatedPropertyData = { ...propertyData, [field]: value };
    if (validateFields(field, value, updatedPropertyData)) {
        setPropertyData(updatedPropertyData);
    }
};

  const onSubmit = async () => {
    // Realiza las validaciones primero
    const validationErrors = validateFields(formState);
    setErrors(validationErrors);

    // Verifica si hay errores de validación
    if (Object.values(validationErrors).every((error) => !error)) {
      // Si no hay errores, intenta enviar el formulario
      try {
        await addDoc(collection(db, "properties"), {
          ...propertyData,
          type: "Bodega",
          propertyStatus,
          propertyCondition,
          propertyOrientation,
          formState,
          images: selectedImages, 
        });
        Alert.alert("Propiedad creada exitosamente");
        navigation.goBack();
      } catch (error) {
        console.log("Error al crear la propiedad:", error);
        Alert.alert("Error al crear la propiedad");
      }
    } else {
      // Si hay errores, muestra los errores (ya están siendo manejados por setErrors)
      console.log("Errores de validación:", validationErrors);
      Alert.alert(
        "Errores en el formulario",
        "Por favor, corrige los errores antes de enviar."
      );
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

          <Text>Región</Text>
          <Picker
            selectedValue={propertyData.region}
            style={styles.inputContainer}
            onValueChange={(itemValue) =>
              handleInputChange("region", itemValue)
            }
          >
            {regions.map((region) => (
              <Picker.Item
                key={region.name}
                label={region.name}
                value={region.name}
              />
            ))}
          </Picker>
          <Text>Comuna</Text>
          <Picker
            selectedValue={propertyData.commune}
            style={styles.inputContainer}
            onValueChange={(itemValue) =>
              handleInputChange("commune", itemValue)
            }
          >
            {regions
              .find((region) => region.name === propertyData.region)
              ?.communes.map((commune) => (
                <Picker.Item key={commune} label={commune} value={commune} />
              ))}
          </Picker>

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
            keyboardType="numeric"
            placeholder="Ingrese número"
            value={propertyData.number}
            onChangeText={(value) => handleInputChange("number", value)}
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
              keyboardType="numeric"
              placeholder="Mínimo"
              value={formState.priceMin}
              onChangeText={(value) =>
                setFormState({ ...formState, priceMin: value })
              }
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Máximo"
              value={formState.priceMax}
              onChangeText={(value) =>
                setFormState({ ...formState, priceMax: value })
              }
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie total</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              placeholder="Min. m²"
              value={formState.surfaceTotalMin}
              onChangeText={(value) =>
                setFormState({ ...formState, surfaceTotalMin: value })
              }
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. m²"
              value={formState.surfaceTotalMax}
              onChangeText={(value) =>
                setFormState({ ...formState, surfaceTotalMax: value })
              }
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie util</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              placeholder="Min. m²"
              value={formState.surfaceUtilMin}
              onChangeText={(value) =>
                setFormState({ ...formState, surfaceUtilMin: value })
              }
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. m²"
              value={formState.surfaceUtilMax}
              onChangeText={(value) =>
                setFormState({ ...formState, surfaceUtilMax: value })
              }
            />
          </View>

          <Text style={CommonStyles.formLabel}>Número de torre</Text>
          <TextInput
            style={CommonStyles.input}
            keyboardType="numeric"
            placeholder="Número de Torre"
            value={propertyData.towerNumber}
            onChangeText={(value) => handleInputChange("towerNumber", value)}
          />

          <Text style={CommonStyles.formLabel}>
            Número de piso de la unidad
          </Text>
          <TextInput
            style={CommonStyles.input}
            keyboardType="numeric"
            placeholder="Número de Piso"
            value={propertyData.floorNumber}
            onChangeText={(value) => handleInputChange("floorNumber", value)}
          />

          <Text style={CommonStyles.formLabel}>Antigüedad</Text>
          <TextInput
            style={CommonStyles.input}
            keyboardType="numeric"
            placeholder="Antigüedad"
            value={propertyData.antiquity}
            onChangeText={(value) => handleInputChange("antiquity", value)}
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

          <Text style={CommonStyles.formLabel}>
            Características adicionales
          </Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Características adicionales"
            value={propertyData.additionalFeature}
            onChangeText={(text) =>
              handleInputChange("additionalFeature", text)
            }
          />

          <TouchableOpacity style={CommonStyles.button}>
            <ImagePickerComponent onImagesSelected={(images) => setSelectedImages([...selectedImages, images])} />
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
