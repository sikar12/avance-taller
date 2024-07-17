import React from "react";
import { View, StyleSheet } from "react-native";
import Mapa from "./maps";
import Header from "./Header";
import BarraBusqueda from "./BarraBusqueda";
import Botones from "./buttons";
import { useNavigation } from '@react-navigation/native';
import {FIRESTORE_DB} from '../../utils/firebase';


const HomeScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Header />
        <BarraBusqueda />
        <Botones />
      </View>
      <Mapa />
    </View>
  );
}
export default HomeScreen;

const styles = StyleSheet.create({
  headerContainer: {

    position: 'absolute',
    zIndex: 10,
    padding: 10,
    width: '100%',
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  }
})