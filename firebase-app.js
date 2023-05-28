// Export
import * as firebase from "firebase/compat";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Your web app's Firebase configuration
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBBUw7yg1zCUACpSTvM5W4Fw3kFpcAP7zc",
    authDomain: "ibca-server.firebaseapp.com",
    databaseURL: 'https://ibca-server.firebaseio.com',
    projectId: "ibca-server",
    storageBucket: "ibca-server.appspot.com",
    messagingSenderId: "539416146913",
    appId: "1:539416146913:web:84b64253bc4ca382f398a0",
});

// Export
const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage };