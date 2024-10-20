

// في service-worker.js
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting(); // لجعل Service Worker نشط فورًا
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  scheduleDailyNotification();
});

function scheduleDailyNotification() {
  const now = new Date();
  
  const morningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0);
  const eveningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 25, 0);

  if (morningTime <= now) morningTime.setDate(morningTime.getDate() + 1);
  if (eveningTime <= now) eveningTime.setDate(eveningTime.getDate() + 1);

  const morningDelay = morningTime - now;
  const eveningDelay = eveningTime - now;

  setTimeout(() => {
    showNotification("تحديثات جديدة!", "تفقد آخر الإعلانات!");
    setInterval(() => showNotification("تحديثات جديدة!", "تفقد آخر الإعلانات!"), 86400000); // تكرار كل 24 ساعة
  }, morningDelay);

  setTimeout(() => {
    showNotification("تحديثات مسائية!", "تفقد آخر الإعلانات في المساء!");
    setInterval(() => showNotification("تحديثات مسائية!", "تفقد آخر الإعلانات في المساء!"), 86400000);
  }, eveningDelay);
}

function showNotification(title, body) {
  self.registration.showNotification(title, {
    body: body,
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/ads.html')
  );
});
