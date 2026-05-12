import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDrDsTzpJpFSLhBSJZKCxxrEaoEEL__md4",
  authDomain: "glowi-694d1.firebaseapp.com",
  projectId: "glowi-694d1",
  storageBucket: "glowi-694d1.firebasestorage.app",
  messagingSenderId: "27152043690",
  appId: "1:27152043690:web:e7a38cb6b4d91159858ad3"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()