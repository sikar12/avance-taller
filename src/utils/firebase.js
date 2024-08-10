import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeWaIAsL469awGaueoGqv7TLjf4WZEyew",
  authDomain: "test-65db7.firebaseapp.com",
  projectId: "test-65db7",
  storageBucket: "test-65db7.appspot.com",
  messagingSenderId: "783523831061",
  appId: "1:783523831061:web:6d18d54f427e865eb75d1c"
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
