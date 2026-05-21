// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyCM6-ELuPxdNQbcqKkDRzRqL-ZIGeyzXak",
  authDomain: "farmlink-2c3d6.firebaseapp.com",
  projectId: "farmlink-2c3d6",
  storageBucket: "farmlink-2c3d6.firebasestorage.app",
  messagingSenderId: "49181203415",
  appId: "1:49181203415:web:25e5d3eb68ab8cc4200992",
  measurementId: "G-2P02M447SS"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
