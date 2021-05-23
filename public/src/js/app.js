var defferedPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('ServiceWorker registered!');
        });
}

window.addEventListener('beforeinstallprompt', function (event) {
    console.log("beforeinstallprompt fired!");
    event.preventDefault();
    defferedPrompt = event;
    return false;
})