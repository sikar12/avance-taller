import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { wp, hp } from "../../utils/ResponsiveUtils";

export default function ProfileSetting() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData = {}, userType = "" } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Campos de usuario
  const [formData, setFormData] = useState({
    // Campos generales
    email: userData.email || "",
    telefono: userData.telefono || "",
    
    // Campos específicos por tipo de usuario
    nombre: userData.nombre || "",
    rut: userData.rut || "",
    nombreEmpresa: userData.nombreEmpresa || "",
    rutEmpresa: userData.rutEmpresa || "",
    razonSocial: userData.razonSocial || "",
    direccion: userData.direccion || "",
    region: userData.region || "",
    comuna: userData.comuna || "",
    sitioWeb: userData.sitioWeb || "",
    descripcion: userData.descripcion || ""
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (userData) {
      setFormData({
        ...formData,
        ...userData
      });
      
      if (userData.profileImageUrl) {
        setProfileImage(userData.profileImageUrl);
      }
    }
  }, [userData]);
  
  // Función para cargar una imagen de perfil
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la galería");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        const uploadUrl = await uploadImageAsync(imageUri);
        setProfileImage(uploadUrl);
        setUploadingImage(false);
        
        // Actualizar la URL de la imagen en Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && userType) {
          const db = getFirestore();
          const userDocRef = await getUserDocRef(user.uid, userType);
          
          if (userDocRef) {
            await updateDoc(userDocRef, {
              profileImageUrl: uploadUrl
            });
            Alert.alert("Éxito", "Imagen de perfil actualizada");
          }
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      setUploadingImage(false);
      Alert.alert("Error", "No se pudo cargar la imagen");
    }
  };
  
  // Función para subir la imagen a Firebase Storage
  const uploadImageAsync = async (uri) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.error(e);
        reject(new TypeError("Error en la red"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    
    const storage = getStorage();
    const fileRef = ref(storage, `profileImages/${user.uid}_${new Date().getTime()}`);
    
    await uploadBytes(fileRef, blob);
    blob.close();
    
    return await getDownloadURL(fileRef);
  };
  
  // Función para obtener la referencia del documento del usuario
  const getUserDocRef = async (uid, userType) => {
    const db = getFirestore();
    
    try {
      const userQuery = query(
        collection(db, userType),
        where("uid", "==", uid)
      );
      
      const snapshot = await getDocs(userQuery);
      
      if (!snapshot.empty) {
        return doc(db, userType, snapshot.docs[0].id);
      }
      
      return null;
    } catch (error) {
      console.error("Error al obtener referencia del documento:", error);
      return null;
    }
  };
  
  // Función para validar el formulario
  const validateForm = () => {
    let valid = true;
    let newErrors = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Formato de correo electrónico inválido";
      valid = false;
    }
    
    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
      valid = false;
    }
    
    // Validaciones específicas por tipo de usuario
    if (userType === "users") {
      if (!formData.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
        valid = false;
      }
      if (!formData.rut.trim()) {
        newErrors.rut = "El RUT es obligatorio";
        valid = false;
      }
    } else if (userType === "inmobiliaria") {
      if (!formData.nombreEmpresa.trim()) {
        newErrors.nombreEmpresa = "El nombre de la empresa es obligatorio";
        valid = false;
      }
      if (!formData.rutEmpresa.trim()) {
        newErrors.rutEmpresa = "El RUT de la empresa es obligatorio";
        valid = false;
      }
    } else if (userType === "corredor") {
      if (!formData.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
        valid = false;
      }
      if (!formData.rut.trim()) {
        newErrors.rut = "El RUT es obligatorio";
        valid = false;
      }
    } else if (userType === "agenciacorretaje") {
      if (!formData.razonSocial.trim()) {
        newErrors.razonSocial = "La razón social es obligatoria";
        valid = false;
      }
      if (!formData.rut.trim()) {
        newErrors.rut = "El RUT es obligatorio";
        valid = false;
      }
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Función para validar cambio de contraseña
  const validatePasswordChange = () => {
    let valid = true;
    let newErrors = {};
    
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "La contraseña actual es obligatoria";
      valid = false;
    }
    
    if (!newPassword.trim()) {
      newErrors.newPassword = "La nueva contraseña es obligatoria";
      valid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres";
      valid = false;
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Función para guardar los cambios en el perfil
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "Usuario no autenticado");
        setLoading(false);
        return;
      }
      
      // Si el email cambió, actualizarlo en Firebase Auth
      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }
      
      // Actualizar datos en Firestore
      const db = getFirestore();
      const userDocRef = await getUserDocRef(user.uid, userType);
      
      if (userDocRef) {
        // Filtrar los campos según el tipo de usuario
        let dataToUpdate = {};
        
        // Campos comunes para todos
        dataToUpdate.telefono = formData.telefono;
        
        if (userType === "users") {
          dataToUpdate = {
            ...dataToUpdate,
            nombre: formData.nombre,
            rut: formData.rut,
            direccion: formData.direccion,
            region: formData.region,
            comuna: formData.comuna
          };
        } else if (userType === "inmobiliaria") {
          dataToUpdate = {
            ...dataToUpdate,
            nombreEmpresa: formData.nombreEmpresa,
            rutEmpresa: formData.rutEmpresa,
            direccion: formData.direccion,
            region: formData.region,
            comuna: formData.comuna,
            sitioWeb: formData.sitioWeb,
            descripcion: formData.descripcion
          };
        } else if (userType === "corredor") {
          dataToUpdate = {
            ...dataToUpdate,
            nombre: formData.nombre,
            rut: formData.rut,
            direccion: formData.direccion,
            region: formData.region,
            comuna: formData.comuna,
            sitioWeb: formData.sitioWeb,
            descripcion: formData.descripcion
          };
        } else if (userType === "agenciacorretaje") {
          dataToUpdate = {
            ...dataToUpdate,
            razonSocial: formData.razonSocial,
            rut: formData.rut,
            direccion: formData.direccion,
            region: formData.region,
            comuna: formData.comuna,
            sitioWeb: formData.sitioWeb,
            descripcion: formData.descripcion
          };
        }
        
        await updateDoc(userDocRef, dataToUpdate);
        Alert.alert("Éxito", "Perfil actualizado correctamente");
        setEditing(false);
      } else {
        Alert.alert("Error", "No se pudo encontrar el documento del usuario");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      
      let errorMessage = "Error al actualizar perfil. Intente nuevamente.";
      
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Esta operación es sensible y requiere que vuelva a iniciar sesión. Por favor, cierre sesión y vuelva a ingresar.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "El correo electrónico ya está en uso por otra cuenta.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    if (!validatePasswordChange()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "Usuario no autenticado");
        setLoading(false);
        return;
      }
      
      // Reautenticar al usuario antes de cambiar la contraseña
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Cambiar la contraseña
      await updatePassword(user, newPassword);
      
      Alert.alert("Éxito", "Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      let errorMessage = "Error al cambiar la contraseña. Intente nuevamente.";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "La contraseña actual es incorrecta.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Esta operación es sensible y requiere que vuelva a iniciar sesión. Por favor, cierre sesión y vuelva a ingresar.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Signin" }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };
  
  // Función para renderizar campos según el tipo de usuario
  const renderUserTypeFields = () => {
    if (userType === "users") {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
              placeholder="Ingrese su nombre completo"
              editable={editing}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={[styles.input, errors.rut && styles.inputError]}
              value={formData.rut}
              onChangeText={(text) => setFormData({...formData, rut: text})}
              placeholder="Ingrese su RUT"
              editable={editing}
            />
            {errors.rut && <Text style={styles.errorText}>{errors.rut}</Text>}
          </View>
        </>
      );
    } else if (userType === "inmobiliaria") {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la Empresa</Text>
            <TextInput
              style={[styles.input, errors.nombreEmpresa && styles.inputError]}
              value={formData.nombreEmpresa}
              onChangeText={(text) => setFormData({...formData, nombreEmpresa: text})}
              placeholder="Ingrese el nombre de la empresa"
              editable={editing}
            />
            {errors.nombreEmpresa && <Text style={styles.errorText}>{errors.nombreEmpresa}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>RUT Empresa</Text>
            <TextInput
              style={[styles.input, errors.rutEmpresa && styles.inputError]}
              value={formData.rutEmpresa}
              onChangeText={(text) => setFormData({...formData, rutEmpresa: text})}
              placeholder="Ingrese el RUT de la empresa"
              editable={editing}
            />
            {errors.rutEmpresa && <Text style={styles.errorText}>{errors.rutEmpresa}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sitio Web</Text>
            <TextInput
              style={styles.input}
              value={formData.sitioWeb}
              onChangeText={(text) => setFormData({...formData, sitioWeb: text})}
              placeholder="Ingrese la URL del sitio web"
              editable={editing}
              autoCapitalize="none"
            />
          </View>
        </>
      );
    }
  };
};  