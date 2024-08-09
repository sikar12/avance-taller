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
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import CommonStyles from "../../utils/CommonStyles";

export default function Add() {
  // Estado para los interruptores
  const [isEstacionamiento, setIsEstacionamiento] = useState(false);
  const [isCalefaccion, setIsCalefaccion] = useState(false);
  const [isAscensor, setIsAscensor] = useState(false);
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [propertyOrientation, setPropertyOrientation] = useState("");
  const [isBodega, setIsBodega] = useState(false);
  const [isSalaDeEstar, setIsSalaDeEstar] = useState(false);
  const [isPiscina, setIsPiscina] = useState(false);
  const [isCondominio, setIsCondominio] = useState(false);
  const [isQuincho, setIsQuincho] = useState(false);
  const [isConserje, setIsConserje] = useState(false);
  const [isGym, setIsGym] = useState(false);
  const [isBasketball, setIsBasketball] = useState(false);
  const [isTennis, setIsTennis] = useState(false);
  const [isSoccer, setIsSoccer] = useState(false);
  const [isPaddle, setIsPaddle] = useState(false);
  const [isMultiSport, setIsMultiSport] = useState(false);
  const [isTerrace, setIsTerrace] = useState(false);
  const [isJacuzzi, setIsJacuzzi] = useState(false);
  const [isParty, setIsParty] = useState(false);
  const [isBalcony, setIsBalcony] = useState(false);
  const [isSauna, setIsSauna] = useState(false);


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
    surfaceTerraceMin: "",
    surfaceTerraceMax: "",
    bedroomMin: "",
    bedroomMax: "",
    bathroomMin: "",
    bathroomMax: "",
    occupantMax: "",
    antiquity: "",
    additionalFeature: "",
    isBodega: false,
    isSalaDeEstar: false,
    isEstacionamiento: false,
    isPiscina: false,
    isCondominio: false,
    isQuincho: false,
    isCalefaccion: false,
    isConserje: false,
    isAscensor: false,
    isGym: false,
    isBasketball: false,
    isTennis: false,
    isSoccer: false,
    isPaddle: false,
    isMultiSport: false,
    isTerrace: false,
    isJacuzzi: false,
    isParty: false,
    isBalcony: false,
    isGreenArea: false,
    isSauna: false,
    propertyStatus: "",
    propertyCondition: "",
    propertyOrientation: "",
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
        <Text style={CommonStyles.header2}>Crear casa</Text>
        <ScrollView
          style={CommonStyles.container}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={CommonStyles.header}>Crear casa</Text>

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
              placeholder="Min."
              value={propertyData.priceMin}
              onChangeText={(value) => handleInputChange("priceMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max."
              value={propertyData.priceMax}
              onChangeText={(value) => handleInputChange("priceMax", value)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Habitaciones</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              placeholder="Min. habitaciones"
              value={propertyData.bedroomMin}
              onChangeText={(value) => handleInputChange("bedroomMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. habitaciones"
              value={propertyData.bedroomMax}
              onChangeText={(value) => handleInputChange("bedroomMax", value)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Baños</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              placeholder="Min. baños"
              value={propertyData.bathroomMin}
              onChangeText={(value) => handleInputChange("bathroomMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. baños"
              value={propertyData.bathroomMax}
              onChangeText={(value) => handleInputChange("bathroomMax", value)}
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
              value={propertyData.surfaceTotalMin}
              onChangeText={(value) => handleInputChange("surfaceTotalMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. m²"
              value={propertyData.surfaceTotalMax}
              onChangeText={(value) => handleInputChange("surfaceTotalMax", value)}
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
              value={propertyData.surfaceUtilMin}
              onChangeText={(value) => handleInputChange("surfaceUtilMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. m²"
              value={propertyData.surfaceUtilMax}
              onChangeText={(value) => handleInputChange("surfaceUtilMax", value)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie terraza</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              placeholder="Min. m²"
              value={propertyData.surfaceTerraceMin}
              onChangeText={(value) => handleInputChange("surfaceTerraceMin", value)}
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max. m²"
              value={propertyData.surfaceTerraceMax}
              onChangeText={(value) => handleInputChange("surfaceTerraceMax", value)}
            />
          </View>

          <Text style={CommonStyles.formLabel}>
            Cantidad maxima de habitantes
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              placeholder="Max"
              value={propertyData.occupantMax}
              onChangeText={(value) => handleInputChange("occupantMax", value)}
            />
          </View>

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

          <Text style={CommonStyles.formLabel}>Bodega</Text>
          <Switch
            value={isBodega}
            onValueChange={(value) => {
              setIsBodega(value);
              handleInputChange("isBodega", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Sala de estar</Text>
          <Switch
            value={isSalaDeEstar}
            onValueChange={(value) => {
              setIsSalaDeEstar(value);
              handleInputChange("isSalaDeEstar", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Estacionamiento</Text>
          <Switch
            value={isEstacionamiento}
            onValueChange={(value) => {
              setIsEstacionamiento(value);
              handleInputChange("isEstacionamiento", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Piscina</Text>
          <Switch
            value={isPiscina}
            onValueChange={(value) => {
              setIsPiscina(value);
              handleInputChange("isPiscina", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Condominio</Text>
          <Switch
            value={isCondominio}
            onValueChange={(value) => {
              setIsCondominio(value);
              handleInputChange("isCondominio", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Quincho</Text>
          <Switch
            value={isQuincho}
            onValueChange={(value) => {
              setIsQuincho(value);
              handleInputChange("isQuincho", value);
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

          <Text style={CommonStyles.formLabel}>Conserje</Text>
          <Switch
            value={isConserje}
            onValueChange={(value) => {
              setIsConserje(value);
              handleInputChange("isConserje", value);
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

          <Text style={CommonStyles.formLabel}>Gimnasio</Text>
          <Switch
            value={isGym}
            onValueChange={(value) => {
              setIsGym(value);
              handleInputChange("isGym", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Basquetbol</Text>
          <Switch
            value={isBasketball}
            onValueChange={(value) => {
              setIsBasketball(value);
              handleInputChange("isBasketball", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Tenis</Text>
          <Switch
            value={isTennis}
            onValueChange={(value) => {
              setIsTennis(value);
              handleInputChange("isTennis", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Fútbol</Text>
          <Switch
            value={isSoccer}
            onValueChange={(value) => {
              setIsSoccer(value);
              handleInputChange("isSoccer", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Paddle</Text>
          <Switch
            value={isPaddle}
            onValueChange={(value) => {
              setIsPaddle(value);
              handleInputChange("isPaddle", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Multicancha</Text>
          <Switch
            value={isMultiSport}
            onValueChange={(value) => {
              setIsMultiSport(value);
              handleInputChange("isMultiSport", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Terraza</Text>
          <Switch
            value={isTerrace}
            onValueChange={(value) => {
              setIsTerrace(value);
              handleInputChange("isTerrace", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Jacuzzi</Text>
          <Switch
            value={isJacuzzi}
            onValueChange={(value) => {
              setIsJacuzzi(value);
              handleInputChange("isJacuzzi", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Salon de Fiestas</Text>
          <Switch
            value={isParty}
            onValueChange={(value) => {
              setIsParty(value);
              handleInputChange("isParty", value);
            }}
          />

          <Text style={CommonStyles.formLabel}>Balcony</Text>
          <Switch
            value={isBalcony}
            onValueChange={(value) => {
              setIsBalcony(value);
              handleInputChange("isBalcony", value);
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

          <Text style={CommonStyles.formLabel}>Sauna</Text>
          <Switch
            value={isSauna}
            onValueChange={(value) => {
              setIsSauna(value);
              handleInputChange("isSauna", value);
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
  logo: {
    top: "-10%",
    left: "225%",
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
});
