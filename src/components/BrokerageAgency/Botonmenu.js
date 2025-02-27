import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BotonMenu = ({ text, onPress }) => {
  return (
    <TouchableOpacity style={styles.botonContenedor} onPress={onPress}>
      <Text style={styles.texto}>{text}</Text>
    </TouchableOpacity>
  );
};
export default BotonMenu;

const styles = StyleSheet.create({
  botonContenedor: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },

  texto: {
    fontWeight: "bold",
  },
});
