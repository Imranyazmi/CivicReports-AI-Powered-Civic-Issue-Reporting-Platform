import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVgeut6dnM43o8dU8xpi7-aRqX--mpXks",
  authDomain: "report-issue-7d791.firebaseapp.com",
  projectId: "report-issue-7d791",
  storageBucket: "report-issue-7d791.firebasestorage.app",
  messagingSenderId: "68133424530",
  appId: "1:68133424530:web:f6c6b5b002c37d2a4f854b",
  measurementId: "G-467Q43VML3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});