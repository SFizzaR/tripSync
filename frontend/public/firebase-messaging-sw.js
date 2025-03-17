importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "AIzaSyDOnSrRXANNOrAaptHcCcMgOrHf2voTen4",
    authDomain: "tripsync-bb119.firebaseapp.com",
    projectId: "tripsync-bb119",
    storageBucket: "tripsync-bb119.appspot.com",
    messagingSenderId: "547785685941",
    appId: "1:547785685941:web:1474c6d85a984d3f8eb7fc",
    measurementId: "G-2N239EHW81"
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw] Recieved background message', payload);
    const NotificationTitle = payload.notification.title
    const NotificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image
    };

    self.registration.showNotification(NotificationTitle, NotificationOptions);

});