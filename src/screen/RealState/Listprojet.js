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
          ...doc.data().propertyData, // Accede a los datos anidados
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
              {item.value && <Text>Valor: {item.value}</Text>}
              {item.surface && <Text>Superficie: {item.surface}</Text>}
              {item.description && <Text>Descripción: {item.description}</Text>}
              {item.status && <Text>Estado: {item.status}</Text>}
              {item.towerNumber && (
                <Text>Número de Torre: {item.towerNumber}</Text>
              )}
              {item.surfaceTotalMax && (
                <Text>Superficie Máxima: {item.surfaceTotalMax} </Text>
              )}
              {item.surfaceTotalMin && (
                <Text>Superficie Mínima: {item.surfaceTotalMin}</Text>
              )}
              {item.surfaceUtilMax && (
                <Text>Superficie Útil Máxima: {item.surfaceUtilMax}</Text>
              )}
              {item.surfaceUtilMin && (
                <Text>Superficie Útil Mínima: {item.surfaceUtilMin} </Text>
              )}
              {item.priceMax && <Text>Precio Máximo: {item.priceMax} </Text>}
              {item.priceMin && <Text>Precio Mínimo: {item.priceMin}</Text>}
              <Text>
                Estacionamiento: {item.isEstacionamiento ? "Sí" : "No"}
              </Text>
              <Text>Calefacción: {item.isCalefaccion ? "Sí" : "No"}</Text>
              <Text>Ascensor: {item.isAscensor ? "Sí" : "No"}</Text>
              <Text>Área Verde: {item.isGreenArea ? "Sí" : "No"}</Text>
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
