var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
}

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
  fetch(jsonURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/simple-pwa-app-d5c53.appspot.com/o/sf-boat.jpg?alt=media&token=7301991c-4431-4163-ad4a-242a024bff25'
    })
  })
    .then((res) => {
      console.log('Send data', res);
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
          location: locationInput.value
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
