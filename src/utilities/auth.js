import firebase from 'firebase';
console.log("here")

var firebaseConfig = {
    apiKey: "AIzaSyD3vVFcVWnSGEJIHom2W_yAZotfFic00gM",
    authDomain: "mmo-authentication-db4a9.firebaseapp.com",
    databaseURL: "https://mmo-authentication-db4a9.firebaseio.com",
    projectId: "mmo-authentication-db4a9",
    storageBucket: "mmo-authentication-db4a9.appspot.com",
    messagingSenderId: "145746630929",
    appId: "1:145746630929:web:79a1ab0f63b648dfdb14b0",
    measurementId: "G-E1XY1FPC5X"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// make auth and firestore references
const auth = firebase.auth();
const db = firebase.firestore();

// Update firestore settings
db.settings({ timestampsInSnapshots: true });
export {
    auth,
    db
}