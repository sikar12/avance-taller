// ImagePickerComponent.js
import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function ImagePickerComponent({ onImagesSelected }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    // Solicitar permisos
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Se necesitan permisos para acceder a la galería.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);

      // Convertir la imagen a Base64
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      onImagesSelected(`data:image/jpeg;base64,${base64}`); // Pasar la imagen en formato Base64
    }
  };

  return (
    <View>
      <Button title="Seleccionar imagen" onPress={pickImage} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
