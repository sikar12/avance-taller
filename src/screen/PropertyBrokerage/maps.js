import React, { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';

<script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBsaXnpyCKYyAu_kGn3QmP_eWdqgftpMyU&libraries=places&callback=initMap"> </script>

const INITIAL_REGION = {
  latitude: -33.444887,
  longitude: -70.654856,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function Mapa() {
  const mapRef = useRef();
  const navigation = useNavigation();
 

  const onRegionChange = (region) => {
    console.log(region);
  };

  const markers = [];
  

  return (
    <View style={ styles.container }>
      <MapView
        style={styles.map}
        //provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={onRegionChange}
        ref={mapRef}
      >
        
          <Marker 
          coordinate={{
            latitude:INITIAL_REGION.latitude,
            longitude:INITIAL_REGION.longitude
          }} 
          >
          <Image source={require('./../../../assets/images/pngegg.png')}
          style={{width: 30, height:30}}
          />
        </Marker>
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});