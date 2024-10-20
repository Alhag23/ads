importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');



importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js");


importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js");



     importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-analytics.js");







// تهيئة Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDkogjqD9spKsj_erC0Dtem-YrjDFuCKBY",
    authDomain: "mithali-8e6f9.firebaseapp.com",
    projectId: "mithali-8e6f9",
    storageBucket: "mithali-8e6f9.appspot.com",
    messagingSenderId: "909535219746",
    appId: "1:909535219746:web:2b5bebbdee43a46e053a7b",
    measurementId: "G-F6XWBLL6CK"
});

// تهيئة Firebase Messaging
const messaging = firebase.messaging();

// التعامل مع الإشعارات في الـ Service Worker
messaging.onBackgroundMessage((payload) => {
    console.log('تم استقبال إشعار في الخلفية:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});