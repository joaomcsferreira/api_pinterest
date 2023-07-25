import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

const API_KEY = process.env.API_KEY as string
const AUTH_DOMAIN = process.env.AUTH_DOMAIN as string
const PROJECT_ID = process.env.PROJECT_ID as string
const STORAGE_BUCKET = process.env.STORAGE_BUCKET as string
const MESSAGING_SENDER_ID = process.env.MESSAGING_SENDER_ID as string
const APP_ID = process.env.APP_ID as string

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
