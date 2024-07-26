// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHBNbJAt9pZ_vUFK9-M9JA3xmBYsIveUU",
  authDomain: "database-a9ca1.firebaseapp.com",
  projectId: "database-a9ca1",
  storageBucket: "database-a9ca1.appspot.com",
  messagingSenderId: "795821529731",
  appId: "1:795821529731:web:61649e5d1d887b6e91d9b6",
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase
const db = getFirestore(firebaseApp);
