import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANGza3ijLrrXDHds2g-mljk4NR5Pf32PQ",
  authDomain: "textdevbr-auth.firebaseapp.com",
  projectId: "textdevbr-auth",
  storageBucket: "textdevbr-auth.firebasestorage.app",
  messagingSenderId: "639840622441",
  appId: "1:639840622441:web:9742ebfb3e839d8f6a4ff8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, githubProvider, db };
