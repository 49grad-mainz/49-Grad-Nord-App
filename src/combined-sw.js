// combined-sw.js
importScripts('./ngsw-worker.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "DEIN_API_KEY_HIER",
  authDomain: "dein-projekt.firebaseapp.com",
  projectId: "dein-projekt-id",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  // Customize notification here
  const notificationTitle = payload.data.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.data.body || 'Background Message Body',
    icon: '/assets/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
