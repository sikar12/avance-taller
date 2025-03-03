import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../utils/firebase"; // Firestore
import { addDoc, collection } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"; // Firebase Authentication
import { wp, hp } from "../../utils/ResponsiveUtils"; // Asumiendo esta ruta



 export default function Addpublication(){

    retunr (
        <View>
            <Text>Hola mundo</Text>
        </View>
        
    )




}
    





    







