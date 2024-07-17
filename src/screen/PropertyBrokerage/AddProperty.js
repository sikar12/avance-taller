import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, ImageBackground, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../utils/firebase';



const image = { src: 'Group.png' };
const RegionesYcomunas = {
    "regiones": [{
        "NombreRegion": "Arica y Parinacota",
        "comunas": ["Arica", "Camarones", "Putre", "General Lagos"]
    },
    {
        "NombreRegion": "Tarapacá",
        "comunas": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
    },
    {
        "NombreRegion": "Coquimbo",
        "comunas": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"]
    },
    {
        "NombreRegion": "Valparaíso",
        "comunas": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"]
    },
    {
        "NombreRegion": "Región del Libertador Gral. Bernardo O’Higgins",
        "comunas": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"]
    },
    {
        "NombreRegion": "Región del Maule",
        "comunas": ["Talca", "ConsVtución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "ReVro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
    },
    {
        "NombreRegion": "Región del Biobío",
        "comunas": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"]
    },
    {
        "NombreRegion": "Región de la Araucanía",
        "comunas": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria",]
    },
    {
        "NombreRegion": "Región de Los Ríos",
        "comunas": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
    },
    {
        "NombreRegion": "Región de Los Lagos",
        "comunas": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "FruVllar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"]
    },
    {
        "NombreRegion": "Región Aisén del Gral. Carlos Ibáñez del Campo",
        "comunas": ["Coihaique", "Lago Verde", "Aisén", "Cisnes", "Guaitecas", "Cochrane", "O’Higgins", "Tortel", "Chile Chico", "Río Ibáñez"]
    },
    {
        "NombreRegion": "Región de Magallanes y de la AntárVca Chilena",
        "comunas": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "AntárVca", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
    },
    {
        "NombreRegion": "Región Metropolitana de Santiago",
        "comunas": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "TilVl", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"]
    }]
};


const Casa = () => {
    const navigation = useNavigation();
    const [regiones, setRegiones] = useState(RegionesYcomunas.regiones.map(region => region.NombreRegion));
    const [comunas, setComunas] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [nombre, setNombre] = useState('');
    const [imagen, setImagen] = useState('');
    const [gcomun, setGcomun] = useState('');
    const [tipo, setTipo] = useState('');
    const [metros, setMetro] = useState('');
    const [dorm, setDorm] = useState('');
    const [baños, setBaños] = useState('');
    const [estacionamiento, setEstacionamiento] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedComuna, setSelectedComuna] = useState('');
    const [precio, setprecio] = useState('');
    const [direc, setDirec] = useState('');
    const [descrip, setDescrip] = useState('');

    const handlePress = () => {
        navigation.navigate('updateProp', { itemId: tuItemId, navigation: navigation });
        navigation.navigate('DeleteP', { itemId: tuItemId, navigation: navigation });

    };


    const addProperty = async () => {
        try {
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'propiedades'), {
                nombre,
                imagen,
                gcomun,
                tipo,
                metros,
                dorm,
                baños,
                estacionamiento,
                region: selectedRegion,
                comuna: selectedComuna,
                precio,
                direc,
                descrip
            });
            console.log('Document written with ID: ', docRef.id);

            // Limpia los campos después de guardar
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
            setprecio('');
            setDirec('');
            setDescrip('');
            alert('Datos guardados correctamente.');
        } catch (error) {
            console.error('Error al guardar los datos:', error);
            alert('No se pudo guardar los datos. Por favor, inténtelo de nuevo.');
        }
    };

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
        const regionData = RegionesYcomunas.regiones.find(item => item.NombreRegion === region);
        if (regionData) {
            setComunas(regionData.comunas);
        } else {
            console.error(`No se encontró ninguna información para la región ${region}`);
            // Aquí podrías manejar el caso en el que no se encuentra la región
        }
    };



    const handleComunaChange = (comuna) => {
        setSelectedComuna(comuna);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            value = { imagen }
            setImagen(result.assets[0].uri); // Aquí actualizas el estado con la URI de la imagen
        }
    };
    const play = () => {
        const [countryData, setCountryData] = useState([]);
        const [stateData, setStateData] = useState([]);
        const [cityData, setCityData] = useState([]);
        const [value, setValue] = useState(null);
        const [isFocus, setIsFocus] = useState(false);
        function myOnLoad() {
            cargar_provincias()
        }

        // funcion para Cargar Provincias al campo <select>
        function cargar_provincias() {
            var array = NombreRegion;

            //carga el arreglo
            array.sort();

            addOptions("provincia", array);
        }

        // Rutina para agregar opciones a un <select>
        function addOptions(domElement, array) {
            var select = document.getElementsByName(domElement)[0];

            for (value in array) {
                var option = document.createElement("option");
                option.text = array[value];
                select.add(option);
            }
        }

    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ImageBackground source={require('../../../assets/images/Group.png')} style={styles.imageBackground}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../../assets/images/volver.png')} />
                    </TouchableOpacity>
                    <View style={styles.formContainer}>
                        <Text style={styles.todoText}>Agregar Propiedades</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='nombre'
                            onChangeText={(nombre) => setNombre(nombre)}
                            value={nombre}
                        />
                        <TouchableOpacity onPress={pickImage}>
                            {imagen ? (
                                <Image source={{ uri: imagen }} style={styles.image} />
                            ) : (
                                <Image source={require('../../../assets/images/Camera.png')} style={styles.cameraImage} />
                            )}
                        </TouchableOpacity>
                        <View style={styles.inputContainer}>
                            <Text>Incluye gastos comunes por</Text>
                            <TextInput
                                style={styles.input1}
                                placeholder='monto'
                                onChangeText={(gcomun) => setGcomun(gcomun)}
                                value={gcomun}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Tipo</Text>
                            <RNPickerSelect
                                style={styles.input1}
                                onValueChange={(tipo) => setTipo(tipo)}
                                value={tipo}
                                items={[
                                    { label: 'Venta', value: 'Venta' },
                                    { label: 'Arriendo', value: 'Arriendo' },
                                    { label: 'Venta y Arriendo', value: 'Venta y Arriendo' },
                                ]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Metros cuadrados construidos</Text>
                            <TextInput
                                style={styles.input}
                                placeholder='METROS CUADRADOS'
                                onChangeText={(metros) => setMetro(metros)}
                                value={metros}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Dormitorios</Text>
                            <RNPickerSelect
                                value={dorm}
                                onValueChange={(dorm) => setDorm(dorm)}
                                items={[
                                    { label: '1', value: '1' },
                                    { label: '2', value: '2' },
                                    { label: '3', value: '3' },
                                    { label: '4', value: '4' },
                                    { label: '5', value: '5' },
                                    { label: '6', value: '6' },
                                ]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Baños</Text>
                            <RNPickerSelect
                                value={baños}
                                onValueChange={(baños) => setBaños(baños)}
                                items={[
                                    { label: '1', value: '1' },
                                    { label: '2', value: '2' },
                                    { label: '3', value: '3' },
                                    { label: '4', value: '4' },
                                    { label: '5', value: '5' },
                                    { label: '6', value: '6' },
                                ]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Estacionamiento</Text>
                            <RNPickerSelect
                                value={estacionamiento}
                                onValueChange={(estacionamiento) => setEstacionamiento(estacionamiento)}
                                items={[
                                    { label: 'Con estacionamiento', value: 'Con estacionamiento' },
                                    { label: 'Sin estacionamiento', value: 'Sin estacionamiento' },
                                ]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Región</Text>
                            <RNPickerSelect
                                value={selectedRegion}
                                onValueChange={(region) => handleRegionChange(region)}
                                items={regiones.map(region => ({ label: region, value: region }))}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Comuna</Text>
                            <RNPickerSelect
                                value={selectedComuna}
                                onValueChange={(comuna) => handleComunaChange(comuna)}
                                items={comunas.map(comuna => ({ label: comuna, value: comuna }))}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Disponible por: $</Text>
                            <TextInput
                                style={styles.input1}
                                placeholder='precio'
                                onChangeText={(precio) => setprecio(precio)}
                                value={precio}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Dirección</Text>
                            <TextInput
                                style={styles.input}
                                placeholder='ej: Av. Siempreviva #313'
                                onChangeText={(direc) => setDirec(direc)}
                                value={direc}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Descripción</Text>
                            <TextInput
                                style={styles.input}
                                placeholder='Descripción'
                                onChangeText={(descrip) => setDescrip(descrip)}
                                value={descrip}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button title="Guardar" onPress={addProperty} />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button title="eliminar" onPress={() => navigation.push('DeleteP')} />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button title="modificar" onPress={() => navigation.push('UpdateProp')} />
                        </View>
                    </View>
                </ImageBackground>
            </ScrollView>
        </SafeAreaView>
    );

};
export default Casa;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',

    },
    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Ajusta la imagen para que cubra todo el área disponible
        justifyContent: 'center',
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
    input1: {
        width: '40%',
        padding: 10,
        backgroundColor: '#d5dbdb',
        height: 40,
        marginTop: 5,
        borderColor: 'black',
        borderRadius: 5,
        top: -35,
        left: '58%',
    },
    select1: {
        top: -35,
        left: '58%',

    },
    todoText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '10%',
    },
    atras: {
        paddingHorizontal: 30,
        position: 'absolute',
        top: 10,
        left: 10,
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 10,
        borderRadius: 5,
    },
    cameraImage: {
        width: 100,
        height: 100,
        marginTop: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        marginTop: 20,
    },
});
