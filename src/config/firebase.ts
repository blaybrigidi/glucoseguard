import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBE5ow4mI_GGYl-0c1HvQcxAXsQgZdLQhM",
    authDomain: "diallog-78c08.firebaseapp.com",
    projectId: "diallog-78c08",
    storageBucket: "diallog-78c08.firebasestorage.app",
    messagingSenderId: "218458882617",
    appId: "1:218458882617:web:8af364666537f1ed00c3e8",
    measurementId: "G-D3T4FKHHPY",
    databaseURL: "https://diallog-78c08-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { auth, db, database, analytics };
