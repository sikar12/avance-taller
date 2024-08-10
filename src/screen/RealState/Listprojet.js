import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { collection, Firestore, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function ListProjet() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data().propertyData, // accedemos a los datos anidados
        }));
        setData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  function renderProject({ item }) {
    return (
      <View>
        <Text>Calle:{item.street}</Text>
        <Text>Numero:{item.number}</Text>
        <Text>comuna:{item.commune}</Text>
        <Text>Antiguedad:{item.antiquity}</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={data}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
