import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Botones = () => {
  const [activeButton, setActiveButton] = useState(null); // Estado para el botón activo

  const toggleActive = (buttonName) => {
    setActiveButton(buttonName === activeButton ? null : buttonName); // Cambia el estado solo si el botón presionado es diferente al botón activo actual
  };

  return (
    <View style={styles.container3}>
      <View style={styles.boton1} >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: activeButton === 'Propiedad en verde' ? '#66C0F1' : '#DCDCDB' }]}
          onPress={() => toggleActive('Propiedad en verde')}>
          <Text style={styles.textboton}>
            <Image source={require('./../../../assets/images/INMOBINDER-06.png')} style={styles.casita} />
            Propiedad en verde
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.boton1} >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: activeButton === 'Propiedad en blanco' ? '#66C0F1' : '#DCDCDB' }]}
          onPress={() => toggleActive('Propiedad en blanco')}>
          <Text style={styles.textboton}>
            <Image source={require('./../../../assets/images/INMOBINDER-04.png')} style={styles.casita} />
            Propiedad en blanco
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.boton1} >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: activeButton === 'Todos' ? '#66C0F1' : '#DCDCDB' }]}
          onPress={() => toggleActive('Todos')}>
          <Text style={styles.textboton}>
            <Image source={require('./../../../assets/images/INMOBINDER-05.png')} style={styles.casita} />
            Todos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Botones;

const styles = {
  container3: {
    flex: 1
  },
  boton1: {
    width: wp('80%'),
    top: 250,
    left: 200,
    width: 150,
    height: 45,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#DCDCDB',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textboton: {
    color: "#ffffff",
    fontSize: 10,
    textAlign: "center"
  },
  casita: {
    width: 30,
    height: 30
  }
};
