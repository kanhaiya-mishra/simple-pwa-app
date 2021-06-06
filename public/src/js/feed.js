var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const videoPlayer = document.querySelector('#player');
const canvas = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');
let picture;
const locationButton = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation = { lat: 0, lng: 0 };

locationButton.addEventListener('click', (event) => {
  let alertShown = false;

  if (!('geolocation' in navigator)) {
    return;
  }

  locationButton.style.display = "none";
  locationLoader.style.display = "block";

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.style.display = "inline";
    locationLoader.style.display = "none";
    fetchedLocation = { lat: position.coords.latitude, lng: 0 };
    locationInput.value = "In India";
    document.querySelector("#manual-location").classList.add("is-focused");
  }, function (err) {
    console.log(err);
    locationButton.style.display = "inline";
    locationLoader.style.display = "none";
    if (!alertShown) {
      alertShown = true;
      alert("Could not find location, Please enter manually!");
    }
    fetchedLocation = fetchedLocation = { lat: 0, lng: 0 };;
  }, { timeout: 7000 })
});

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationButton.display = "none";
  }
}

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error('Get user media is not implemented!'));
      }
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch((err) => {
      captureButton.style.display = "none";
      imagePickerArea.style.display = 'block';
    })
}

captureButton.addEventListener('click', function (event) {
  canvas.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';

  const context = canvas.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
  picture = dataURItoBlob(canvas.toDataURL());
});

function openCreatePostModal() {
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  initializeMedia();
  initializeLocation();
}

function closeCreatePostModal() {
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvas.style.display = 'none';
  locationButton.style.display = 'inline';
  locationLoader.style.display = 'none';
  captureButton.style.display = 'inline';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
    });
  };
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 1);
}

imagePicker.addEventListener('change', (event) => {
  picture = event.target.files[0];
})

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(data) {
  if (!data) return;
  var cardWrapper = document.createElement('div');
  cardWrapper.setAttribute('id', 'card-wrapper');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.backgroundPosition = 'bottom';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function clearCards() {
  while (sharedMomentsArea.firstChild) {
    sharedMomentsArea.removeChild(sharedMomentsArea.firstChild);
  }
}

let jsonURL = window.BACKEND_URL + "/pwa-posts";

let networdDataRecieved = false;

fetch(jsonURL)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log('From web', data);
    networdDataRecieved = true;
    let postArray = [];
    for (let key in data) {
      postArray.push(data[key]);
    }
    updateUI(postArray);
  });

function updateUI(data) {
  clearCards();
  data.forEach((post) => {
    createCard(post);
  })
}

function sendData() {
  const id = new Date().toISOString;
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('file', Picture, id + '.png');

  fetch(jsonURL, {
    method: 'POST',
    body: postData
  })
    .then((res) => {
      console.log('Data sent', res);
    })
}

if ('indexedDB' in window) {
  readAllData('posts')
    .then((data) => {
      if (!networdDataRecieved) {
        console.log('From cache', data);
        updateUI(data);
      }
    })
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (titleInput.value.trim() === "" && locationInput.value.trim() === "") {
    alert("Please enter valid data");
    return;
  }
  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((sw) => {
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value,
          picture: picture,
          rawLocation: fetchedLocation
        }
        return writeData('sync-posts', post)
          .then(() => {
            return sw.sync.register('sync-new-posts');
          })
          .then(() => {
            let snackbarContainer = document.querySelector('#confirmation-toast');
            let data = { message: "Your post was saved for syncing!" };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch((err) => {
            console.log(err);
          })
      })
  } else {
    sendData();
  }
})

// fetch('https://httpbin.org/get')
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });
