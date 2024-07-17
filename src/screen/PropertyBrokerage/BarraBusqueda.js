import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SearchBar } from "react-native-screens";
import { View, StyleSheet} from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FontAwesome } from '@expo/vector-icons';

 //se carga npm install react-native-google-places-autocomplete --save
 //desde https://www.npmjs.com/package/react-native-google-places-autocomplete
const BarraBusqueda = () => {
    return (
        <View style={styles.buscar}>
          
           <GooglePlacesAutocomplete
             placeholder='    Buscar'
             onPress={(data, details = null) => {
             // 'details' is provided when fetchDetails = true
              console.log(data, details);
           }}
            query={{
            key: 'AIzaSyBbVfDN-ESlfg8SQv5eCMBDsMUjg1Mudus',
            language: 'en',
            }}
           />
           <FontAwesome name="search" size={20} color="#969696" />
        </View>
    )
}
export default BarraBusqueda;

const styles=StyleSheet.create({
  buscar:{
    width: 257,
    height: 30,
    top: -60,
    left: -10,
    ShadowRoot: 4,
    textDecorationColor: '#969696',
    display :'flex',
    backgroundColor: '#d9d9d9',
    borderRadius: 15,

  }
})