import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHBNbJAt9pZ_vUFK9-M9JA3xmBYsIveUU",

  authDomain: "database-a9ca1.firebaseapp.com",

  projectId: "database-a9ca1",

  storageBucket: "database-a9ca1.appspot.com",

  messagingSenderId: "795821529731",

  appId: "1:795821529731:web:61649e5d1d887b6e91d9b6",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

// Inicializa Firestore
const db = firebase.firestore();

export { db };
