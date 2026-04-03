import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDOoTQhZ8G_ulD25WrgFSUND3SLi-cjPuo",
    authDomain: "mental-wellness-ai-6edb0.firebaseapp.com",
    projectId: "mental-wellness-ai-6edb0",
    storageBucket: "mental-wellness-ai-6edb0.firebasestorage.app",
    messagingSenderId: "514002865206",
    appId: "1:514002865206:web:c589d37b791631cf219c97"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;