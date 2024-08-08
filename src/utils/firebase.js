// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeWaIAsL469awGaueoGqv7TLjf4WZEyew",
  authDomain: "test-65db7.firebaseapp.com",
  projectId: "test-65db7",
  storageBucket: "test-65db7.appspot.com",
  messagingSenderId: "783523831061",
  appId: "1:783523831061:web:06e70ebaceb0f226b75d1c"
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase
export const db = getFirestore(firebaseApp);
