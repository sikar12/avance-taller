import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, FlatList, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getFirestore, getDocs, onSnapshot } from 'firebase/firestore'; // Añade onSnapshot aquí
import { FIRESTORE_DB } from '../../utils/firebase';

const CRUD = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(getFirestore(), 'propiedades'), (snapshot) => {
            setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            setError(error);
        });

        return () => unsubscribe();
    }, []);

    const renderUsuarios = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer}>
                <Image source={{ uri: item.imagen }} style={styles.imagenPropiedad} />
                <Text>{item.nombre}</Text>
                <Text>{item.tipo}</Text>
                <Text>{item.direc}</Text>
                <Button
                    onPress={() => navigation.navigate('User', { itemId: item.id })}
                    title='Ver'
                />

            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text>Listado propiedades</Text>
            <ImageBackground source={require('../../../assets/images/Group.png')} resizeMode="cover" style={styles.imageBackground}>
                <TouchableOpacity style={styles.atras} onPress={() => navigation.goBack()}>
                    <Image source={require('../../../assets/images/volver.png')} />
                </TouchableOpacity>
                <View style={styles.form}>
                    {loading ? (
                        <Text>Loading...</Text>
                    ) : error ? (
                        <Text>Error: {error}</Text>
                    ) : (
                        <FlatList
                            data={todos}
                            renderItem={renderUsuarios}
                            keyExtractor={item => item.id}

                        />


                    )}

                </View>
            </ImageBackground>

        </View>
    );
};

export default CRUD;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginTop: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        backgroundColor: '#d5dbdb',
        height: 40,
        marginTop: 5,
        borderColor: 'black',
        borderRadius: 5,
    },
    todoText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    atras: {
        paddingHorizontal: 30,
        position: 'absolute',
        top: 10,
        left: 10,
    },
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    imagenPropiedad: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
    },
});
