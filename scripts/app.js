let menuOptions = [
    { name: 'characters-content', fetchFunction: fechCharacters },
    { name: 'comics-content', fetchFunction: fetchComics },
    { name: 'series-content', fetchFunction: fetchSeries }
];

const applicationServerPublicKey = 'BEfvceD4CtwVMHKK1fE0OKjozMpxAVuXwNo5YvV-nn4qT7a5dEGhnzE7iZ117EdlbLpWPi8DWH84kRVS3jqQhac';
const firebaseServerUrl = 'https://us-central1-marvel-commics-store.cloudfunctions.net';
let defaultOption = 'characters-content';
let swRegistration = null;
let isSubscribed = false;
let userSubstrciption = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function postData(firebaseFunction, data) {
    // Default options are marked with *
    return fetch(`${firebaseServerUrl}/${firebaseFunction}`, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // //   credentials: 'same-origin', // include, same-origin, *omit
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        // mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        // referrer: 'no-referrer', // *client, no-referrer
    })
        .then(response => console.log(response))
        .catch(error => console.log(error)); // parses response to JSON
}

function fetchFirebaseData(firebaseFunction) {
    return fetch(`${firebaseServerUrl}/${firebaseFunction}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
        }
    });
}

function onDrawerMenuClick() {
    let elem = document.getElementById('drawer-menu');
    if (elem) {
        let isOpen = elem.classList.contains('drawer-opened');

        let classToRemove = isOpen ? 'opened' : 'closed';
        let classToAdd = !isOpen ? 'opened' : 'closed';

        elem.classList.remove(`drawer-${classToRemove}`);
        elem.classList.add(`drawer-${classToAdd}`);
    }
}

function onSelectOption(option) {
    window.location.hash = `#${option}`;
    onDrawerMenuClick();
}

function initializeUI() {
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(onUserSubscribed);
}

function updateBtnNotification() {

    let elem = document.getElementById('icon-notification');

    if (elem) {
        elem.classList.remove(`fa-bell${isSubscribed ? '-slash' : ''}`);
        elem.classList.add(`fa-bell${!isSubscribed ? '-slash' : ''}`);
        elem.setAttribute('title', `turn ${isSubscribed ? 'off' : 'on'} notifications`);
    }
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    return swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(onUserSubscribed)
        .catch((err) => {
            alert(`Failed to subscribe the user: ${err}`);
        });
}

function onUserSubscribed(subscription) {
    isSubscribed = subscription !== null;
    userSubstrciption = subscription;

    updateBtnNotification();

    if (isSubscribed) {
        console.log('User IS subscribed.');
        postData('addSubscription', subscription);
    } else {
        console.log('User is NOT subscribed.');
    }
}

function unsubscribeUser() {
    return userSubstrciption.unsubscribe().then((subscription) => {
        console.log('User is unsubscribe.');
        isSubscribed = false;
    }).catch((err) => {
        console.log('Failed to unsubscribe the user: ', err);
    });
}

function onClickNotificationBtn() {
    if (isSubscribed)
        unsubscribeUser()
    else
        subscribeUser();
}

function notifyAll() {
    fetchFirebaseData('sendNotification');
}

(function () {
    'use strict';

    window.onhashchange = function () {
        if (window.location.hash) {
            menuOptions.forEach(item => {
                let elem = document.getElementById(item.name);
                if (elem) {
                    let isVisible = item.name === window.location.hash.substr(1);
                    elem.style.display = isVisible ? 'block' : 'none';
                    if (isVisible)
                        item.fetchFunction();
                }
            });
        }
    }

    onSelectOption(defaultOption);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./service-worker.js').then((registration) => {
                swRegistration = registration;
                initializeUI();
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    } else {
        console.warn('Push messaging is not supported');
    }
})();