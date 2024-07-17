import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../style';

const propiedad = ({ route, navigation }) => {
    const { itemId } = route.params; //parametro del dato
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [rut, setRut] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(FIRESTORE_DB, 'todos', itemId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data) {
                        setNombre(data.nombre || '');
                        setApellido(data.apellido || '');
                        setRut(data.rut || '');
                    }
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.log('Error getting document:', error);
            }
        };
        fetchData();
    }, [itemId]);

    const deleteItem = async () => {
        const docRef = doc(FIRESTORE_DB, 'todos', itemId);
        await deleteDoc(docRef);
        alert("El dato fue eliminado");
        navigation.goBack(); // Vuelve a la lista
    };
   
    const update = async () => {
        const docRef = doc(FIRESTORE_DB, 'todos', itemId);
        try {
            await updateDoc(docRef, {
                nombre: nombre,
                apellido: apellido,
                rut: rut
            });
            setNombre('');
            setApellido('');
            setRut('');
            alert("El dato fue modificado");
            navigation.goBack(); // Vuelve a la lista
        } catch (error) {
            console.error('no funciona:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setNombre(text)}
                    value={nombre}
                />
            </View>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setApellido(text)}
                    value={apellido}
                />
            </View>
            <View style={styles.todoText}>
                <Text style={styles.textStyle}>
                    {nombre} {}
                    {apellido} {}
                    {rut}
                </Text>
            </View>
            <View style={styles.container}>
                <TouchableOpacity onPress={update} disabled={nombre === '' || apellido === ''}>
                    <MaterialIcons name="update" size={40} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteItem}>
                    <Ionicons name="trash-bin-outline" size={40} color="green" />
                </TouchableOpacity>
                <Button title="Volver" onPress={() => navigation.goBack()} />
            </View>
            <Button
                onPress={() => navigation.navigate('Mapa')}
                title='Mapa'
            />
        </View>
    );
};

export default propiedad;
