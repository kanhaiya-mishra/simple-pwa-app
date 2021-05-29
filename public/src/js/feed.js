var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
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
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
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

let jsonURL = "https://simple-pwa-app-d5c53-default-rtdb.firebaseio.com/posts.json";
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

if ('indexedDB' in window) {
  readAllData('posts')
    .then((data) => {
      if (!networdDataRecieved) {
        console.log('From cache', data);
        updateUI(data);
      }
    })
}


// fetch('https://httpbin.org/get')
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });
