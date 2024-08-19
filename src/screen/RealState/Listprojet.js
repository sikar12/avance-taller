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
          ...doc.data(),
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
              {item.type && <Text>Tipo de Proyecto:{item.type} </Text>}
              {item.propertyStatus && (
                <Text>Estado de la propiedad: {item.propertyStatus}</Text>
              )}
              {item.propertyCondition && (
                <Text>Condicion de la propiedad: {item.propertyCondition}</Text>
              )}
              {item.region && <Text>Región: {item.region} </Text>}
              {item.commune && <Text>Comuna: {item.commune}</Text>}
              {item.street && <Text>Calle: {item.street}</Text>}
              {item.number && <Text>Número: {item.number}</Text>}
              {item.antiquity && <Text>Antigüedad: {item.antiquity} años</Text>}
              {item.towerNumber && (
                <Text>Numero de torres: {item.towerNumber}</Text>
              )}
              {item.occupantMax && (
                <Text>Numero de ocupantes: {item.occupantMax}</Text>
              )}

              {item.floorNumber && (
                <Text>Numero de pisos: {item.floorNumber}</Text>
              )}
              {item.fromeState && <Text>NOSE{item.fromeState}</Text>}
              {item.priceMin && <Text>Precio Mínimo: ${item.priceMin}</Text>}
              {item.priceMax && <Text>Precio Máximo: ${item.priceMax}</Text>}
              {item.surfaceTotalMax && (
                <Text> Superficie maxima {surfaceTotalMax}</Text>
              )}

              {item.additionalFeature && (
                <Text>característica adicional: {item.additionalFeature}</Text>
              )}
              {item.surfaceTotalMin && (
                <Text>Superficie Total Mínima: {item.surfaceTotalMin} m²</Text>
              )}
              {item.surfaceTotalMax && (
                <Text>Superficie Total Máxima: {item.surfaceTotalMax} m²</Text>
              )}
              {item.surfaceUtilMin && (
                <Text>Superficie Útil Mínima: {item.surfaceUtilMin} m²</Text>
              )}
              {item.surfaceUtilMax && (
                <Text>Superficie Útil Máxima: {item.surfaceUtilMax} m²</Text>
              )}
              {item.propertyDepartment && (
                <Text>Tipo de oficina: {item.propertyDepartment} </Text>
              )}

              {/* validacion de booleanos */}
              {item.isCalefaccion !== undefined && (
                <Text>Calefacción: {item.isCalefaccion ? "Sí" : "No"}</Text>
              )}
              {item.isEstacionamiento !== undefined && (
                <Text>
                  Estacionamiento: {item.isEstacionamiento ? "Sí" : "No"}
                </Text>
              )}
              {item.isAscensor !== undefined && (
                <Text>Ascensor: {item.isAscensor ? "Sí" : "No"}</Text>
              )}
              {item.isGreenArea !== undefined && (
                <Text>Áreas Verdes: {item.isGreenArea ? "Sí" : "No"}</Text>
              )}

              {item.isBalcony !== undefined && (
                <Text>Balcon: {item.isBalcony ? "Sí" : "No"}</Text>
              )}

              {item.isBasketball !== undefined && (
                <Text>
                  Cancha de Basketball: {item.isBasketball ? "Sí" : "No"}
                </Text>
              )}
              {item.isBodega !== undefined && (
                <Text>Bodega: {item.isBodega ? "Sí" : "No"}</Text>
              )}
              {item.isGym !== undefined && (
                <Text>Gimnasio: {item.isGym ? "Sí" : "No"}</Text>
              )}

              {item.isMultiSport !== undefined && (
                <Text>Multicancha: {item.isMultiSport ? "Sí" : "No"}</Text>
              )}

              {item.isPaddle !== undefined && (
                <Text>Cancha de paddle: {item.isPaddle ? "Sí" : "No"}</Text>
              )}

              {item.isSalaDeEstar !== undefined && (
                <Text>Sala de estar: {item.isSalaDeEstar ? "Sí" : "No"}</Text>
              )}

              {item.isSoccer !== undefined && (
                <Text>Cancha de futbol: {item.isSoccer ? "Sí" : "No"}</Text>
              )}

              {item.isTennis !== undefined && (
                <Text>Cancha de tenis: {item.isTennis ? "Sí" : "No"}</Text>
              )}
              {item.isTerrace !== undefined && (
                <Text>Terrasa: {item.isTerrace ? "Sí" : "No"}</Text>
              )}

              {item.isCondominio !== undefined && (
                <Text>Condominio: {item.isCondominio ? "Sí" : "No"}</Text>
              )}

              {item.isConserje !== undefined && (
                <Text>Conserje: {item.isConserje ? "Sí" : "No"}</Text>
              )}

              {item.isJacuzzi !== undefined && (
                <Text>jacuzzi: {item.isJacuzzi ? "Sí" : "No"}</Text>
              )}
              {item.isParty !== undefined && (
                <Text>Sala de fiestas: {item.isParty ? "Sí" : "No"}</Text>
              )}
              {item.isPiscina !== undefined && (
                <Text>Piscina: {item.isPiscina ? "Sí" : "No"}</Text>
              )}
              {item.isQuincho !== undefined && (
                <Text>Quincho: {item.isQuincho ? "Sí" : "No"}</Text>
              )}
              {item.isSauna !== undefined && (
                <Text>Sauna: {item.isSauna ? "Sí" : "No"}</Text>
              )}
              {item.isMascotas !== undefined && (
                <Text>
                  Se permiten mascotas: {item.isMascotas ? "Sí" : "No"}
                </Text>
              )}

              {/* validacion de booleanos */}

              {item.propertyOrientation && (
                <Text>Orientación: {item.propertyOrientation}</Text>
              )}
              {item.description && <Text>Descripción: {item.description}</Text>}
              {/* Si hay imágenes, muestra una o varias */}
              {item.images && item.images.length > 0 && (
                <View style={styles.imageContainer}>
                  {item.images.map((imageUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUri }}
                      style={styles.image}
                    />
                  ))}
                </View>
              )}
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
  imageContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
});
