document.addEventListener('DOMContentLoaded', function () {
    const adsRef = database.ref("ads");

    document.getElementById('postAdForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const adTitle = document.getElementById('adTitle').value;
        const adDescription = document.getElementById('adDescription').value;
        const adPrice = document.getElementById('adPrice').value;
        const adContactInfo = document.getElementById('adContactInfo').value;
        const adType = document.getElementById('adType').value;
        const fileInput = document.getElementById('adImage');
        const file = fileInput.files[0];
        const uploadProgress = document.getElementById('uploadProgress');

        if (file) {
            const storageRef = storage.ref('ad-images/' + file.name);

            // Show the progress bar
            uploadProgress.style.display = 'block';

            // Start the upload process
            const uploadTask = storageRef.put(file);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    uploadProgress.value = progress;
                    console.log('Upload is ' + progress + '% done');
                }, 
                (error) => {
                    console.error('Error uploading image:', error);
                    alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
                }, 
                () => {
                    // Upload completed successfully, now we can get the download URL
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        const newAdRef = adsRef.push();
                        
                        // الحصول على التاريخ الفعلي للإعلان
                        const currentDate = new Date().toISOString(); // تنسيق ISO لتخزين التاريخ والوقت

                        newAdRef.set({
                            title: adTitle,
                            description: adDescription,
                            price: adPrice,
                            contactInfo: adContactInfo,
                            type: adType,
                            imageUrl: downloadURL,
                            approved: false,
                            date: currentDate // إضافة التاريخ الفعلي للإعلان
                        }).then(() => {
                            console.log('تم إرسال الإعلان بنجاح!');
                            alert('تم إرسال الإعلان بنجاح!');
                            
                            // إعادة تعيين الحقول بعد الإرسال الناجح
                            document.getElementById('postAdForm').reset();
                            
                            // Hide the progress bar after completion
                            uploadProgress.style.display = 'none';
                            uploadProgress.value = 0; // Reset progress bar
                        }).catch((error) => {
                            console.error('Error posting ad:', error);
                        });
                    });
                }
            );
        } else {
            alert('يرجى اختيار صورة للرفع.');
        }
    });
});
