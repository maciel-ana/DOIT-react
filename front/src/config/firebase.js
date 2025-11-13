import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { 
    apiKey: "AIzaSyBcWHymuVUsXI1gbARQQ1zpk-lUNSpXQ2w",
    authDomain: "doit-28816.firebaseapp.com",
    projectId: "doit-28816",
    storageBucket: "doit-28816.firebasestorage.app",
    messageSenderId: "476094917121",
    appId: "1:476094917121:web:a81d0d22dadddab34bae00"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);