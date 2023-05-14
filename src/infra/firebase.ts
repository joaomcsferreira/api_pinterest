import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsPuXvyZ9RCh-F9hBbhNlLO-4UR4_kJ6o",
  authDomain: "pinterest-cloud.firebaseapp.com",
  projectId: "pinterest-cloud",
  storageBucket: "pinterest-cloud.appspot.com",
  messagingSenderId: "435860486497",
  appId: "1:435860486497:web:255c847d3b2db42b48ad20",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
