var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var infoModal = document.getElementById('info-modal');

function openInfoModal(imageSrc, title, location, description) {
  var modal = document.getElementById('info-modal');
  var imageElement = document.getElementById('info-image');
  var titleElement = document.getElementById('info-title');
  var locationElement = document.getElementById('info-location');
  var descriptionElement = document.getElementById('info-description');

  imageElement.src = imageSrc;
  titleElement.textContent = title;
  locationElement.textContent = location;
  descriptionElement.textContent = description;

  modal.style.display = 'block';
}
function closeInfoModal() {
  var modal = document.getElementById('info-modal');

  modal.style.display = 'none';
  // modal.style.visibility = 'hidden';
}

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}


// if (shareImageButton) {
//   shareImageButton.addEventListener('click', openCreatePostModal);
// }
shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function(cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function redirectToDetailsPage(imageUrl, title, location, description) {
  // Redirect to a new page with image information
  var detailsUrl = `/details.html?imageSrc=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}&description=${encodeURIComponent(description)}`;
  window.location.href = detailsUrl;
  console.log('Redirecting to details page with:', imageUrl, title, location, description);
}

function createCard(data, index) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.backgroundPosition = 'center'; 
  cardTitle.style.height = '200px'; 
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

  // View Details Button
  var viewDetailsButton = document.createElement('button');
  viewDetailsButton.className = 'mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-color--accent';
  viewDetailsButton.textContent = 'View Details';

  viewDetailsButton.addEventListener('click', function() {
    var imageUrl = data.image;
    var title = data.title;
    var location = data.location;
    var description = data.description;

    openInfoModal(imageUrl, title, location, description);
    redirectToDetailsPage(imageUrl, title, location, description);
  });

  // Append the View Details Button to the card
  cardWrapper.appendChild(viewDetailsButton);

  cardWrapper.style.marginRight = '10px'; 

  cardWrapper.addEventListener('click', function() {
    console.log('tes'); 
    var imageUrl = data.image;
    var title = data.title;
    var location = data.location;
    var description = data.description;
  
    openInfoModal(imageUrl, title, location, description);
  });

  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i], i);
  }
}

var url = 'https://fennec-caade-default-rtdb.asia-southeast1.firebasedatabase.app/posts:.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}
