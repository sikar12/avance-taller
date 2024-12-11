import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Verification() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      console.log("Archivo seleccionado:", result);

      if (result.type === "success") {
        const allowedExtensions = ["pdf", "doc", "docx"];
        const fileExtension = result.name.split(".").pop().toLowerCase();

        // Validación de extensión
        if (!allowedExtensions.includes(fileExtension)) {
          Alert.alert("Error", "El tipo de archivo no es permitido.");
          return;
        }

        // Validación de tamaño
        if (result.size > 5 * 1024 * 1024) {
          Alert.alert(
            "Error",
            "El archivo supera el tamaño máximo permitido de 5MB."
          );
          return;
        }

        setSelectedFile(result);
        Alert.alert("Archivo seleccionado", `Nombre: ${result.name}`);
      } else {
        console.log("Selección de archivo cancelada.");
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el archivo.");
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !selectedFile.uri) {
      Alert.alert("Error", "No se ha seleccionado un archivo válido.");
      return;
    }

    try {
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const storage = getStorage(); // Inicializa Firebase Storage
      const storageRef = ref(storage, `documents/${selectedFile.name}`);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      setFileUrl(url);
      Alert.alert("Éxito", "Archivo subido correctamente.");
    } catch (error) {
      console.error("Error al subir archivo:", error);
      Alert.alert("Error", "Hubo un problema al subir el archivo.");
    }
  };

  return (
    <ImageBackground
      style={styles.background}
      source={require("../../../assets/images/Group.png")}
    >
      <View>
        <Image
          style={styles.logo}
          source={require("../../../assets/images/INMOBINDER-03.png")}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Verificación de perfil</Text>
        <Text style={styles.row}>
          Para poder verificar su perfil, por favor ingrese una fotocopia de su
          carnet por ambos lados.
        </Text>

        <TouchableOpacity style={styles.buton} onPress={handleSelectFile}>
          <Text style={styles.Text}>Seleccionar archivo</Text>
        </TouchableOpacity>

        {selectedFile && (
          <Text style={styles.fileInfo}>
            Archivo seleccionado: {selectedFile.name}
          </Text>
        )}

        <TouchableOpacity style={styles.buton} onPress={handleUploadFile}>
          <Text style={styles.Text}>Subir archivo</Text>
        </TouchableOpacity>

        <Text style={styles.texto2}>
          Tipos de archivos permitidos: PDF, DOC, DOCX
        </Text>
        <Text style={styles.texto2}>Tamaño máximo: 5MB</Text>

        {fileUrl && (
          <Text style={styles.fileInfo}>
            Archivo subido:{" "}
            <Text
              style={{ color: "blue" }}
              onPress={() => Linking.openURL(fileUrl)}
            >
              {fileUrl}
            </Text>
          </Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    top: "17%",
  },
  container: {
    marginTop: "10%",
    width: "90%",
    top: "-18%",
    left: "5%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  logo: {
    height: 260,
    width: 260,
    justifyContent: "center",
    alignItems: "center",
    left: "20.5%",
    top: "-42%",
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  Text: {
    color: "#F8F8FF",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    margin: 5,
  },
  row: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
  texto2: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  fileInfo: {
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
});
