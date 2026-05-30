// Royal Essenza - Firebase Configuration & Realtime Sync Module
const firebaseConfig = {
  apiKey: "AIzaSyAqVUbh1-VK0eu1LCxYGp-0I5fA8lhrPXI",
  authDomain: "royal-essenza.firebaseapp.com",
  databaseURL: "https://royal-essenza-default-rtdb.firebaseio.com",
  projectId: "royal-essenza",
  storageBucket: "royal-essenza.firebasestorage.app",
  messagingSenderId: "36939997548",
  appId: "1:36939997548:web:916a52cd6c01f89ebad349"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
console.log("Firebase Realtime database connected successfully!");
