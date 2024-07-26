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
import { database, db } from "../../utils/firebase";
import CommonStyles from "../../utils/CommonStyles";

export default function Add() {
  // Estado para los interruptores
  const [isBodega, setIsBodega] = useState(false);
  const [isSalaDeEstar, setIsSalaDeEstar] = useState(false);
  const [isEstacionamiento, setIsEstacionamiento] = useState(false);
  const [isCalefaccion, setIsCalefaccion] = useState(false);
  const [isConserje, setIsConserje] = useState(false);
  const [isAscensor, setIsAscensor] = useState(false);
  const [isBasketball, setIsBasketball] = useState(false);
  const [isGym, setIsGym] = useState(false);
  const [isTennis, setIsTennis] = useState(false);
  const [isSoccer, setIsSoccer] = useState(false);
  const [isPaddle, setIsPaddle] = useState(false);
  const [isGreenArea, setIsGreenArea] = useState(false);
  const [isMultiSport, setIsMultiSport] = useState(false);
  const [isBalcony, setIsBalcony] = useState(false);
  const [isTerrace, setIsTerrace] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [propertyDepartment, setPropertyDepartment] = useState("");
  const [propertyOrientation, setPropertyOrientation] = useState("");

  const [propertyData, setPropertyData] = useState({
    description: "",
    direction: "",
    bathrooms: "",
    totalSurface: "",
    utilSurface: "",
    terraceSurface: "",
    age: "",
    aditional: "",
  });

  const navigation = useNavigation();
  const handleInputChange = (name, value) => {
    setPropertyData({ ...propertyData, [name]: value });
  };

  const onSubmit = async () => {
    try {
      const address = `${propertyData.street} ${propertyData.number}, ${propertyData.commune}, ${propertyData.region}`;
      await addDoc(collection(db, "properties"), {
        ...propertyData,
        address,
      });
      Alert.alert("La propiedad ha sido creada exitosamente");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.error("Error adding document: ");
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
        <Text style={CommonStyles.header2}>Crear Oficina</Text>
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

          <Text style={CommonStyles.formLabel}>Dirección</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese dirección"
            onChangeText={(value) => handleInputChange("direction", value)}
          />

          <Text style={CommonStyles.formLabel}>Descripción</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese descripción de la propiedad"
            onChangeText={(value) => handleInputChange("description", value)}
          />

          <Text style={CommonStyles.formLabel}>Precio</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min."
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max."
            />
          </View>

          <Text style={CommonStyles.formLabel}>Baños</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min."
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie total</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min. m²"
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max. m²"
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie util</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min. m²"
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max. m²"
            />
          </View>

          <Text style={CommonStyles.formLabel}>Superficie terraza</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Min. m²"
            />
            <TextInput
              style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Max. m²"
            />
          </View>

          <Text style={CommonStyles.formLabel}>Antigüedad</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Años"
            onChangeText={(value) => handleInputChange("age", value)}
          />

          <Text style={CommonStyles.formLabel}>Tipo de Oficina</Text>
          <View style={styles.optionButtonContainer}>
            {renderOptionButton(
              "Semipiso",
              "semipiso",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Triplex",
              "triplex",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Loft",
              "loft",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Penthouse",
              "penthouse",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Departamento",
              "departamento",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Duplex",
              "duplex",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Monoambiente",
              "monoambiente",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Ph",
              "ph",
              propertyDepartment,
              setPropertyDepartment
            )}
            {renderOptionButton(
              "Piso",
              "psi",
              propertyDepartment,
              setPropertyDepartment
            )}
          </View>

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
          <Switch value={isBodega} onValueChange={setIsBodega} />
          <TextInput style={CommonStyles.input} placeholder="Indique cuantas" />

          <Text style={CommonStyles.formLabel}>Sala de estar</Text>
          <Switch value={isSalaDeEstar} onValueChange={setIsSalaDeEstar} />

          <Text style={CommonStyles.formLabel}>Estacionamiento</Text>
          <Switch
            value={isEstacionamiento}
            onValueChange={setIsEstacionamiento}
          />

          <Text style={CommonStyles.formLabel}>Calefacción</Text>
          <Switch value={isCalefaccion} onValueChange={setIsCalefaccion} />

          <Text style={CommonStyles.formLabel}>Conserje</Text>
          <Switch value={isConserje} onValueChange={setIsConserje} />

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

          <Text style={CommonStyles.formLabel}>Balcón</Text>
          <Switch value={isBalcony} onValueChange={setIsBalcony} />

          <Text style={CommonStyles.formLabel}>Area verde</Text>
          <Switch value={isGreenArea} onValueChange={setIsGreenArea} />

          <Text style={CommonStyles.formLabel}>Ascensor</Text>
          <Switch value={isAscensor} onValueChange={setIsAscensor} />

          <Text style={CommonStyles.formLabel}>Otra</Text>
          <TextInput
            style={CommonStyles.input}
            placeholder="Ingrese característica adicional"
            onChangeText={(value) => handleInputChange("aditional", value)}
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
