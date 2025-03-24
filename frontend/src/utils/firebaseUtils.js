import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyDOnSrRXANNOrAaptHcCcMgOrHf2voTen4",
    authDomain: "tripsync-bb119.firebaseapp.com",
    projectId: "tripsync-bb119",
    storageBucket: "tripsync-bb119.appspot.com",
    messagingSenderId: "547785685941",
    appId: "1:547785685941:web:1474c6d85a984d3f8eb7fc",
    measurementId: "G-2N239EHW81"
}

const vapidKey = "BG-r0Y5hb5j6sQdS180zIgBmBoV2x0OZfl7bvvAWkLRzAV4oNEtAWIKz8e6w0VQVbtdM4KlZBxdrrUDU7RGPa8g";

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const generateToken = async () => {
    const permission = await Notification.requestPermission();
    console.log(permission);
    if (permission === "granted") {
        const token = await getToken(messaging, { vapidKey });
        console.log(token);
    }
}

