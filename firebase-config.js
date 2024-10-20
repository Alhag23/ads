// firebase-config.js
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkogjqD9spKsj_erC0Dtem-YrjDFuCKBY",
    authDomain: "mithali-8e6f9.firebaseapp.com",
    databaseURL: "https://mithali-8e6f9-default-rtdb.firebaseio.com",
    projectId: "mithali-8e6f9",
    storageBucket: "mithali-8e6f9.appspot.com",
    messagingSenderId: "909535219746",
    appId: "1:909535219746:web:2b5bebbdee43a46e053a7b",
    measurementId: "G-F6XWBLL6CK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


const storage = firebase.storage();

const database = 
firebase.database();


const messaging = firebase.messaging();


const analytics =
firebase.analytics();

