import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
      },
      map: {
        width: '100%',
        height: '100%',
      },
      container2: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '180%',
    },
    
    redondeado: {
        borderradius: 5,
    },
   
    input: {
        //borderRadius: 30,
        width: '80%',
        padding: 10,
        backgroundColor: 'lightgrey',
        height: 40,
        marginTop: 10,
        borderColor: 'black',
    },
    todoText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    atras: {
        top: -50,
        paddingHorizontal: 30,
        left: -30,

    },
    headerContainer: {

        position: 'absolute',
        zIndex: 10,
        padding: 10,
        width: '100%',
        paddingHorizontal: 20,
        flexGrow: 1,
        justifyContent: 'space-between',
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
  
  
      },
      container3: {
        flex: 1
      },
    
      boton1: {
        height: hp('70%'), // 70% of height device screen
        width: wp('80%'),
        top: 250,
        left: 200,
        width: 150,
        height: 45,
        borderRadius: 99,
        ImageBackground: 'grey', // Color del borde
        justifyContent: "center", // Para centrar el ícono verticalmente
        alignItems: "center", // Para centrar el ícono horizontalmente
        backgroundColor: '#53BAF4DE',
        marginBottom: 10, // Espacio entre botones
    
      },
      textboton: {
        color: "#ffffff", // Color blanco para el texto
        fontSize: 10, // Tamaño de fuente como número
        textAlign: "center" // Centrar el texto
    
      },
      casita: {
        width: 30,
        height: 30
    
      }
});

export default styles;
