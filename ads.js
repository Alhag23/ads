document.addEventListener('DOMContentLoaded', function () {
    const adsRef = database.ref('ads');
    const approvedAdsContainer = document.getElementById('approvedAdsContainer');
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // مدة 30 يوم بالمللي ثانية

    // الاستماع للإعلانات المعتمدة فقط وفرزها حسب التاريخ الأحدث (تنازلي)
    adsRef.orderByChild('approved').equalTo(true).on('value', function (snapshot) {
        approvedAdsContainer.innerHTML = ''; // تفريغ المحتوى الحالي

        const adsArray = []; // تخزين الإعلانات في مصفوفة مؤقتة لترتيبها لاحقاً

        snapshot.forEach(function (childSnapshot) {
            const ad = childSnapshot.val();
            const adId = childSnapshot.key;

            // التحقق من تاريخ الإعلان
            const adDate = new Date(ad.date);
            const currentDate = new Date();

            // حذف الإعلانات التي مر عليها أكثر من 30 يومًا
            if (currentDate - adDate > THIRTY_DAYS_MS) {
                deleteAd(adId); // حذف الإعلان من قاعدة البيانات
                return; // عدم عرض الإعلان المحذوف
            }

            // إضافة الإعلان إلى المصفوفة
            adsArray.push({ adId, ...ad });
        });

        // ترتيب الإعلانات بناءً على التاريخ الأحدث (تنازلي)
        adsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // إنشاء محتوى عمودي لكل إعلان
        adsArray.forEach(function (adData) {
            const { adId, title, description, price, contactInfo, date, imageUrl, likes, dislikes, votes } = adData;

            // إنشاء عنصر div للإعلان
            const adContainer = document.createElement('div');
            adContainer.classList.add('ad-container');

            // إنشاء عنوان الإعلان
            const titleElement = document.createElement('h2');
            titleElement.textContent = title;
            adContainer.appendChild(titleElement);

            // إضافة الصورة
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'صورة الإعلان';
            imageElement.style.width = '100%'; // ضبط حجم الصورة
            adContainer.appendChild(imageElement);

            // إضافة الوصف
            const descriptionElement = document.createElement('h3');
            descriptionElement.textContent = description;
            adContainer.appendChild(descriptionElement);

            // إضافة السعر
            const priceElement = document.createElement('h4');
            priceElement.textContent = `السعر: ${price}`;
            adContainer.appendChild(priceElement);

            // إضافة معلومات الاتصال
            const contactInfoElement = document.createElement('h4');
            contactInfoElement.textContent = `معلومات الاتصال: ${contactInfo}`;
            adContainer.appendChild(contactInfoElement);

            // إضافة التاريخ
            const dateElement = document.createElement('h4');
            dateElement.textContent = `تاريخ النشر: ${date ? new Date(date).toLocaleDateString('ar-EG') : 'غير متاح'}`;
            adContainer.appendChild(dateElement);

            // إضافة أزرار اللايك والديسلايك
            const likeDislikeContainer = document.createElement('div');
            const likeButton = document.createElement('button');
            likeButton.textContent = `👍 (${likes || 0})`;
            likeButton.addEventListener('click', function () {
                handleVote(adId, true);
            });

            const dislikeButton = document.createElement('button');
            dislikeButton.textContent = `👎 (${dislikes || 0})`;
            dislikeButton.addEventListener('click', function () {
                handleVote(adId, false);
            });

            likeDislikeContainer.appendChild(likeButton);
            likeDislikeContainer.appendChild(dislikeButton);
            adContainer.appendChild(likeDislikeContainer);

            // إضافة واجهة الدردشة
            const chatContainer = document.createElement('div');
            chatContainer.innerHTML = renderChatInterface(adId);
            adContainer.appendChild(chatContainer);

            // إضافة الإعلان إلى الحاوية الرئيسية
            approvedAdsContainer.appendChild(adContainer);

            // تحميل رسائل الدردشة للإعلان
            loadChatMessages(adId);
        });
    });

    // دالة للتعامل مع التصويت (لايك أو ديسلايك)
    function handleVote(adId, isLike) {
        const userId = getUserId(); // الحصول على معرف المستخدم أو عنوان IP

        // التحقق مما إذا كان المستخدم قد قام بالفعل بالتصويت على هذا الإعلان
        const voteRef = database.ref(`ads/${adId}/votes/${userId}`);
        voteRef.once('value', function (snapshot) {
            if (snapshot.exists()) {
                alert('لقد قمت بالفعل بالتصويت على هذا الإعلان.');
                return;
            }

            // تحديث عدد اللايكات أو الديسلايكات في Firebase
            const adRef = database.ref(`ads/${adId}`);
            adRef.transaction(function (ad) {
                if (ad) {
                    if (isLike) {
                        ad.likes = (ad.likes || 0) + 1;
                    } else {
                        ad.dislikes = (ad.dislikes || 0) + 1;
                    }
                    // تسجيل تصويت المستخدم لمنعه من التصويت مرة أخرى
                    ad.votes = ad.votes || {};
                    ad.votes[userId] = isLike ? 'like' : 'dislike';
                }
                return ad;
            }).then(() => {
                console.log('تم تسجيل التصويت بنجاح.');
            }).catch((error) => {
                console.error('حدث خطأ أثناء التصويت:', error);
            });
        });
    }


    

    // دالة لحذف الإعلان من قاعدة البيانات
    function deleteAd(adId) {
        const adRef = adsRef.child(adId);
        adRef.remove()
            .then(() => {
                console.log('تم حذف الإعلان الأقدم من 30 يومًا بنجاح.');
            })
            .catch((error) => {
                console.error('حدث خطأ أثناء حذف الإعلان:', error);
            });
    }



});


    // انشاء معرف فريد 
    

    // دالة لتوليد معرف مستخدم فريد
    function getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }




            
    
    // الدالة لإرسال الرسالة إلى الدردشة
    function sendMessage(adId) {
        const messageInput = document.getElementById(`messageInput-${adId}`);
        const messageText = messageInput.value;

        if (messageText.trim() !== '') {
            const chatRef = database.ref(`ads/${adId}/chats`);
            const newMessageRef = chatRef.push();
            newMessageRef.set({
                sender: "اسم المستخدم", // يجب استبداله باسم المستخدم الفعلي
                text: messageText,
                timestamp: new Date().toISOString()
            });

            messageInput.value = ''; // تفريغ الحقل بعد الإرسال
        }
    }

    // تحميل رسائل الدردشة لكل إعلان
    function loadChatMessages(adId) {
        const chatRef = database.ref(`ads/${adId}/chats`);
        const chatMessagesContainer = document.getElementById(`chat-messages-${adId}`);

        chatRef.on('child_added', function(snapshot) {
            const messageData = snapshot.val();

    
            
            const messageElement = document.createElement('div');
            messageElement.textContent = `${messageData.sender}: ${messageData.text} (${new Date(messageData.timestamp).toLocaleString('ar-EG')})`;
            chatMessagesContainer.appendChild(messageElement);
        });
    }



window.sendMessage = function(adId) {  // تعديل هنا لجعل الدالة عالمية
        const messageInput = document.getElementById(`messageInput-${adId}`);
        const messageText = messageInput.value;

        if (messageText.trim() !== '') {
            const chatRef = database.ref(`ads/${adId}/chats`);
            const newMessageRef = chatRef.push();
            newMessageRef.set({
                sender: "زبون ", // يجب استبداله باسم المستخدم الفعلي
                text: messageText,
                timestamp: new Date().toISOString()
            });

  messageInput.value = ''; // تفريغ الحقل بعد الإرسال
        }
    }


                                   

function isMessageAppropriate(text) {
    const bannedWords = 
         ['حمار', 'كلب', 'ملعون', 'كذاب', 'طرطور', 'قحبة', 'بنت', 'مريم', 'شليه', 'قبح', 'قذر', 'شمات', 'لك', 'اللعنة', 'قلبي', 'دلوع', 'افحر', 'انيك', 'وسخ', 'تدلل', 'نذل', 'انا', 'احبك','يا','رقم','مجموعتي','انظم','فيك','حلوة','اعشق','متزوج','زوج','زواجة','مزه','مزز','مزة','دردشه','دردشة','ملاعين','مخانيث','قحاب','مره','مرة','واحده','واحدة','عشيقه','عشيقة','تعشق','زوجه','زواجه','نسوان','نساء','مجموعه','مجموعة','أعشقك','أحبك','اموت','بنت','بنات','تعالي','أموت', 'ساقط', 'سارق', 'واطي', 'زب', 'طيز', 'مخنوث']; // قائمة الكلمات المحظورة
        // قائمة الكلمات المحظورة
    for (let word of bannedWords) {
        if (text.includes(word)) {
            return false; // يحتوي النص على كلمة محظورة
        }
    }
    return true; // النص مقبول
}

window.sendMessage = function(adId) {
    const messageInput = document.getElementById(`messageInput-${adId}`);
    const messageText = messageInput.value;

    if (messageText.trim() !== '') {
        if (!isMessageAppropriate(messageText)) {
            alert("تم اكتشاف نص غير مناسب. يرجى تعديل رسالتك.");
            return; // إيقاف العملية إذا كانت الرسالة تحتوي على كلمات محظورة
        }

        const chatRef = database.ref(`ads/${adId}/chats`);
        const newMessageRef = chatRef.push();
        newMessageRef.set({
            sender: "زبون  ", //يجب استبداله باسم المستخدم الفعلي
            text: messageText,
            timestamp: new Date().toISOString()
        });

        messageInput.value = ''; // تفريغ الحقل بعد الإرسال
    }
}

                                    
window.deleteAllMessages = function(adId) {
    // تأكيد قبل الحذف
    if (confirm("هل أنت متأكد من أنك تريد حذف جميع الرسائل لهذا الإعلان؟")) {
        const chatRef = database.ref(`ads/${adId}/chats`);

        // حذف جميع الرسائل المرتبطة بالإعلان
        chatRef.remove()
            .then(() => {
                alert("تم حذف جميع الرسائل بنجاح.");
                
                // تحديث واجهة المستخدم بعد الحذف
                const chatMessagesContainer = document.getElementById(`chat-messages-${adId}`);
                chatMessagesContainer.innerHTML = ''; // تفريغ الرسائل المعروضة في واجهة المستخدم
            })
            .catch((error) => {
                console.error("حدث خطأ أثناء حذف الرسائل:", error);
                alert("حدث خطأ أثناء حذف الرسائل. يرجى المحاولة مرة أخرى.");
            });
    }
}






    

