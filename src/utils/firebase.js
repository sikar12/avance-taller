import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTP9EsaDXWdvNoEOb1M0bZsoC0q6IZOaE",

  authDomain: "pruebasloggin-ecf50.firebaseapp.com",

  projectId: "pruebasloggin-ecf50",

  storageBucket: "pruebasloggin-ecf50.firebasestorage.app",

  messagingSenderId: "215402617688",

  appId: "1:215402617688:web:a3e994d7e561c72f81a32d"

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
