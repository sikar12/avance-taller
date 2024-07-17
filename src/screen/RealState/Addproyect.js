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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import { CommonStyles } from "../../components/RealState/example";

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
  const [propertyType, setPropertyType] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const navigation = useNavigation();

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
    <ScrollView
      style={CommonStyles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={CommonStyles.header}>Crear Proyecto</Text>

      <Text style={CommonStyles.formLabel}>Tipo de propiedad</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton("Casa", "casa", propertyType, setPropertyType)}
        {renderOptionButton(
          "Departamento",
          "departamento",
          propertyType,
          setPropertyType
        )}
        {renderOptionButton(
          "Parcela",
          "parcela",
          propertyType,
          setPropertyType
        )}
        {renderOptionButton(
          "Condominio",
          "condominio",
          propertyType,
          setPropertyType
        )}
      </View>

      <Text style={CommonStyles.formLabel}>Propiedad en</Text>
      <View style={styles.optionButtonContainer}>
        {renderOptionButton(
          "Arriendo",
          "arriendo",
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
      <TextInput style={CommonStyles.input} placeholder="Ingrese dirección" />

      <Text style={CommonStyles.formLabel}>Descripción</Text>
      <TextInput
        style={CommonStyles.input}
        placeholder="Ingrese descripción de la propiedad"
        multiline
      />

      <Text style={CommonStyles.formLabel}>Precio</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Min."
        />
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Max."
        />
      </View>

      <Text style={CommonStyles.formLabel}>Habitaciones</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Min."
        />
      </View>

      <Text style={CommonStyles.formLabel}>Baños</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Min."
        />
      </View>

      <Text style={CommonStyles.formLabel}>Metros construidos</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Min. m²"
        />
        <TextInput
          style={[CommonStyles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Max. m²"
        />
      </View>

      <Text style={CommonStyles.formLabel}>Bodega</Text>
      <Switch value={isBodega} onValueChange={setIsBodega} />

      <Text style={CommonStyles.formLabel}>Sala de estar</Text>
      <Switch value={isSalaDeEstar} onValueChange={setIsSalaDeEstar} />

      <Text style={CommonStyles.formLabel}>Estacionamiento</Text>
      <Switch value={isEstacionamiento} onValueChange={setIsEstacionamiento} />

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

      <Text style={CommonStyles.formLabel}>Otra</Text>
      <TextInput
        style={CommonStyles.input}
        placeholder="Ingrese característica adicional"
      />

      <TouchableOpacity style={CommonStyles.button}>
        <Text style={CommonStyles.buttonText}>Editar fotografías</Text>
      </TouchableOpacity>

      <TouchableOpacity style={CommonStyles.button}>
        <Text style={CommonStyles.buttonText}>Aplicar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={CommonStyles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={CommonStyles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
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
});
