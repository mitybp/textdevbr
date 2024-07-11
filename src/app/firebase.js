import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF3jbJ3u8bUzqtxCodlFPU_wxB_0mOvYo",
  authDomain: "textdevbr.firebaseapp.com",
  projectId: "textdevbr",
  storageBucket: "textdevbr.appspot.com",
  messagingSenderId: "689650046242",
  appId: "1:689650046242:web:2dc8ceaa20e8f25f7c417b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
