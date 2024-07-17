import React, { createElement, useEffect, useState } from 'react';
import {
    View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Image, Picker, ImageBackground, SafeAreaView,
    StatusBar, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import { FIRESTORE_DB } from '../../utils/firebase';
import { addDoc, collection } from 'firebase/firestore';
import {NavigationContainer  } from '@react-navigation/native';

const DeleteP = () => {
    const deleteItem = async () => {
        const docRef = doc(FIRESTORE_DB, 'todos', itemId);
        await deleteDoc(docRef);
        alert("El dato fue eliminado");
        navigation.goBack(); // Vuelve a la lista
    };
    
  return (
    <View>
      <Text>Borrar</Text>
    </View>
  );
};

export default DeleteP;
