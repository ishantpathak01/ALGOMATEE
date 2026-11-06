import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPY-nxez3QcurwcGWdftWxx1pZxUhoflo",
  authDomain: "algomate-501ad.firebaseapp.com",
  projectId: "algomate-501ad",
  storageBucket: "algomate-501ad.firebasestorage.app",
  messagingSenderId: "1072276208906",
  appId: "1:1072276208906:web:cacc3b4911aea0d1a60ef3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
