const enableNotificationsButtons = document.querySelectorAll(".enable-notifications");

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function (err) {
            console.log(err);
        });
}

function configurePushSub() {
    if (!('serviceWorker' in navigator)) return;
    let reg;
    navigator.serviceWorker.ready
        .then((swReg) => {
            reg = swReg;
            return swReg.pushManager.getSubscription();
        })
        .then((subscrptions) => {
            if (subscrptions === null) {
                const vapidPublicKey = "BB7O5FaAHodo77WbDPk_W2Rr2hkNA7FpDpXe3VCA45VhzLme9h5ezOCUrU7r8DKs1eUGABKFxRUw7hz3zj3Ljqk";
                const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                //Create a new subscription
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                });
            } else {
                //We have a subscription
            }
        })
        .then((newSubscription) => {
            return fetch(window.BACKEND_URL + "/subscription", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSubscription)
            })
        })
        .then((res) => {
            if (res.ok) {
                displayConfirmNotification();
            }
        })
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        const options = {
            body: 'You have sucessfully subscribed to our browser notifications!',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            lang: 'en-US', //BCP 47
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                {
                    action: 'confirm',
                    title: 'Ok',
                    icon: '/src/images/icons/app-icon-96x96.png'
                },
                {
                    action: 'cancel',
                    title: 'Cancel',
                    icon: '/src/images/icons/app-icon-96x96.png'
                }
            ]
        };
        navigator.serviceWorker.ready
            .then((swReg) => {
                swReg.showNotification('Successfully Subscribed! - From SW', options);
            })
    }
}

function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        if (result !== 'granted') {
            console.log("Oops!");
        } else {
            // displayConfirmNotification();
            configurePushSub();
        }
    });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (let i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}