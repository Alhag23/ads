// تثبيت الـ Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting(); // لجعل Service Worker نشط فورًا بعد التثبيت
});

// تفعيل الـ Service Worker وجدولة الإشعارات
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  clients.claim(); // تأكد من أن جميع الصفحات تعمل عبر Service Worker فوراً
  scheduleDailyNotification(); // جدولة الإشعارات اليومية
  checkAndSendNotifications(); // فحص الإشعارات فور التفعيل
});
scheduleDailyNotification();  // اختبر الجدولة بعد تفعيل Service Worker
showNotification("اختبار الإشعارات", "هذه رسالة   فورية!");  // عرض إشعار فورًا للتأكد من عمل الإشعارات


// هنا يتم جدولة الإشعارات كما تم شرحها سابقًا
function scheduleDailyNotification() {
  const now = new Date();
  
  const morningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
  const eveningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 15, 0);

  if (morningTime <= now) morningTime.setDate(morningTime.getDate() + 1);
  if (eveningTime <= now) eveningTime.setDate(eveningTime.getDate() + 1);

  const morningDelay = morningTime - now;
  const eveningDelay = eveningTime - now;

  // جدولة الإشعار الصباحي
  setTimeout(() => {
    showNotification("تحديثات جديدة!", "تفقد افضل الإعلانات!");
    setInterval(() => showNotification("تحديثات صباحبة  جديدة!", "تفقد آخر الإعلانات!"), 86400000); // تكرار كل 24 ساعة
  }, morningDelay);

  // جدولة الإشعار المسائي
  setTimeout(() => {
    showNotification("تحديثات مسائية!", "تفقد آخر الإعلانات في المساء!");
    setInterval(() => showNotification("تحديثات مسائية!", "تفقد آخر الإعلانات في المساء!"), 86400000);
  }, eveningDelay);
}

// فحص الإشعارات في كل مرة يتم تنشيط الـ Service Worker
function checkAndSendNotifications() {
  const now = new Date();
  const morningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
  const eveningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 15, 0);

  // تحقق إذا كان الوقت الآن هو الصباح
  if (now >= morningTime && now < (morningTime.getTime() + 60000)) {
    showNotification("تحديثات جديدة!", "تفقد آخر الإعلانات!");
  }

  // تحقق إذا كان الوقت الآن هو المساء
  if (now >= eveningTime && now < (eveningTime.getTime() + 60000)) {
    showNotification("تحديثات مسائية!", "تفقد آخر الإعلانات في المساء!");
  }
}

// عرض الإشعار
function showNotification(title, body) {
  self.registration.showNotification(title, {
    body: body,
    vibrate: [200, 100, 200], // الاهتزاز
  });
}

// حدث النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/ads.html') // افتح صفحة الإعلانات عند النقر على الإشعار
  );
});
