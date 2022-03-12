import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAjj318OH-8l4SdxcKq30pARKsQack8xT4",
  authDomain: "fictionbooks.firebaseapp.com",
  databaseURL: "https://fictionbooks-default-rtdb.firebaseio.com",
  projectId: "fictionbooks",
  storageBucket: "fictionbooks.appspot.com",
  messagingSenderId: "396455250657",
  appId: "1:396455250657:web:8aaf376ee77a90149a45a0",
};
const app_data = initializeApp(firebaseConfig);
export default app_data;
