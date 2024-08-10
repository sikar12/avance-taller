import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { StyleSheet } from "react-native";

export default function ListProjet() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data().propertyData,
          ...doc.data().formState,
          ...doc.data().propertyStatus,
          ...doc.data().propertyCondition,
          ...doc.data().propertyDepartment,
        }));
        setData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../assets/images/Group.png")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {data.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              {item.region && <Text>Región: {item.region} </Text>}
              {item.commune && <Text>Comuna: {item.commune}</Text>}
              {item.street && <Text>Calle: {item.street}</Text>}
              {item.number && <Text>Número: {item.number}</Text>}
              {item.antiquity && <Text>Antigüedad: {item.antiquity}</Text>}
              {item.formState?.value && <Text>Valor: {item.formState.value}</Text>}
              {item.formState?.surfaceTotalMax && (
                <Text>Superficie Máxima: {item.formState.surfaceTotalMax} </Text>
              )}
              {item.formState?.surfaceTotalMin && (
                <Text>Superficie Mínima: {item.formState.surfaceTotalMin}</Text>
              )}
              {item.formState?.surfaceUtilMax && (
                <Text>Superficie Útil Máxima: {item.formState.surfaceUtilMax}</Text>
              )}
              {item.formState?.surfaceUtilMin && (
                <Text>Superficie Útil Mínima: {item.formState.surfaceUtilMin} </Text>
              )}
              {item.formState?.priceMax && <Text>Precio Máximo: {item.formState.priceMax} </Text>}
              {item.formState?.priceMin && <Text>Precio Mínimo: {item.formState.priceMin}</Text>}
              <Text>Estacionamiento: {item.formState?.isEstacionamiento ? "Sí" : "No"}</Text>
              <Text>Calefacción: {item.formState?.isCalefaccion ? "Sí" : "No"}</Text>
              <Text>Ascensor: {item.formState?.isAscensor ? "Sí" : "No"}</Text>
              <Text>Área Verde: {item.formState?.isGreenArea ? "Sí" : "No"}</Text>
              {/* Agrega más campos aquí según sea necesario */}
            </View>
          ))}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scrollContainer: {
    padding: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
});