import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const Listings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings: ", error);
      }
    };

    fetchListings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.address}>{item.address}</Text>
      <Text>{item.description}</Text>
      <Text>{`Precio: ${item.priceMin} - ${item.priceMax}`}</Text>
      <Text>{`Superficie Total: ${item.surfaceTotalMin} - ${item.surfaceTotalMax}`}</Text>
      <Text>{`Superficie Útil: ${item.surfaceUtilMin} - ${item.surfaceUtilMax}`}</Text>
      {/* Agrega más campos según sea necesario */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Publicaciones</Text>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  address: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Listings;
