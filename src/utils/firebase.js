// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyByGTbgF_nfYtrXeMD6puacg1TTZUhd4yY",

  authDomain: "tesis-30ec1.firebaseapp.com",

  projectId: "tesis-30ec1",

  storageBucket: "tesis-30ec1.firebasestorage.app",

  messagingSenderId: "901895460291",

  appId: "1:901895460291:web:27595b75a0d848a9b15976",

  measurementId: "G-0XCYBJ2LWV"


};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar servicios de Firebase
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };