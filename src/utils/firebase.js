import { initializeApp } from 'firebase/app';
//import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsaXnpyCKYyAu_kGn3QmP_eWdqgftpMyU",
  authDomain: "proyecto-7c294.firebaseapp.com",
  projectId: "proyecto-7c294",
  storageBucket: "proyecto-7c294.appspot.com",
  messagingSenderId: "459690733295",
  appId: "1:459690733295:web:14de4edbd197cdf2df751a"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
//export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

