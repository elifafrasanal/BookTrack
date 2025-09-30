// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABApwgPetdkl_5Mh9p62SQ83iEZ3iShJk",
  authDomain: "booktrack-6bdd5.firebaseapp.com",
  projectId: "booktrack-6bdd5",
  //storageBucket: "booktrack-6bdd5.firebasestorage.app",
  storageBucket: "booktrack-6bdd5.appspot.com",
  messagingSenderId: "735940311580",
  appId: "1:735940311580:web:79001dc55700c3214cfdd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
//name export yapıyoruz import ederken aynı ismi kullancaz
export { auth, db, googleProvider };

//dosyanın ana objesi gibi düsün ,import ederken ismi değiştirebiliriz
export default app;
