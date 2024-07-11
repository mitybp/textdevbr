import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArCdySnNvK_Itck7tWmDtMnaxNxaPwGP0",
  authDomain: "textdevbr-56cc6.firebaseapp.com",
  projectId: "textdevbr-56cc6",
  storageBucket: "textdevbr-56cc6.appspot.com",
  messagingSenderId: "74693030866",
  appId: "1:74693030866:web:8396352c7d4afb804dce0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
