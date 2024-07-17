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
import DeleteP from "./deleteP";
import { NavigationContainer } from '@react-navigation/native';



const image = { src: 'Group.png' };
const UpdateProp = () => {
    const navigation = useNavigation();
    const update = async () => {
        const docRef = doc(FIRESTORE_DB, 'todos', itemId);
        try {
            await updateDoc(docRef, {
                nombre: nombre,
                imagen: imagen,
                gcomun: gcomun,
                tipo: tipo,
                metros: metros,
                dormitorios: dorm,
                baños: baños,
                estacionamiento: estacionamiento,
                region: selectedRegion,
                comuna: selectedComuna,
                direccion: direc,
                descripcion: descrip,

            });
            setNombre('');
            setImagen('');
            setGcomun('');
            setTipo('');
            setMetro('');
            setDorm('');
            setBaños('');
            setEstacionamiento('');
            setSelectedRegion('');
            setSelectedComuna('');
            setDirec('');
            setDescrip('');
            alert("El dato fue modificado");
            navigation.goBack(); // Vuelve a la lista
        } catch (error) {
            console.error('no funciona:', error);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ImageBackground source={require('../../../assets/images/Group.png')} style={styles.imageBackground}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../../assets/images/volver.png')} />
                    </TouchableOpacity>
                </ImageBackground >
            </ScrollView>
        </SafeAreaView>


    );
};

export default UpdateProp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Ajusta la imagen para que cubra todo el área disponible
        justifyContent: 'center',
    },
    atras: {
        paddingHorizontal: 30,
        position: 'absolute',
        top: 10,
        left: 10,
    },
});
