  import React from "react";
  import { View, Text, Image, Button, ImageBackground, TouchableOpacity } from "react-native";
  import { Entypo, FontAwesome5 } from '@expo/vector-icons';
  import BarraBusqueda from "./BarraBusqueda";
  import Casa from "./AddProperty";
  import {
    useNavigationBuilder,
    createNavigatorFactory,
    NavigationContainer,
  } from '@react-navigation/native';
  import { useNavigation } from '@react-navigation/native';
  import CRUD from "./property";
 


  const Header = () => {
    const navigation = useNavigation();
  
    const handlePress = () => {
      navigation.navigate('CRUD', { itemId: tuItemId, navigation: navigation });
    };

    return (
      <View >
        <View style={styles.iconContainer} >
          
          <TouchableOpacity onPress={()=> navigation.push('CRUD')}>
            <Entypo name="menu" size={30} color="grey" />
          </TouchableOpacity>
        </View>
        <View>
          <Image style={styles.logo} source={require('./../../../assets/images/INMOBINDER-03.png')}></Image>
        </View>
        <View style={styles.filter}>
          <FontAwesome5 name="filter" size={24} color="white" />
        </View>
      </View>
    );
  };

  export default Header;

  const styles = {
    container: {
      // Estilos para el contenedor principal si es necesario
    },
    iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 99,
      justifyContent: "center", // Para centrar el ícono verticalmente
      alignItems: "center", // Para centrar el ícono horizontalmente
      backgroundColor: '#d9d9d9',
      opacity: 0.5,
      shadowOpacity: 10,
      top: 20,
      shadowRadius: 4,
      /*  width: 60,
      height: 60,
      
      left: 10,
  */
    },
    logo: {
      width: 120,
      height: 110,
      top: -15,
      left: 100,
    },
    filter: {
      Width: 107,
      Height: 31,
      top: -15,
      left: 250,
      width: 100,
      height: 45,
      borderRadius: 99,
      ImageBackground: 'grey', // Color del borde
      justifyContent: "center", // Para centrar el ícono verticalmente
      alignItems: "center", // Para centrar el ícono horizontalmente
      backgroundColor: '#53BAF4DE',


    }
  };
