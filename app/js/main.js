

const container = document.getElementById('container');

// Append jsText to the container
let jsText = document.createElement("p");
jsText.className = "js-text";
jsText.innerText = "This has been added by the js/main.js";
container.appendChild(jsText);

// Register the serice worker - To Save the js, html and css files in the browser's cache memory
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log(`Service Worker registered! Scope: ${registration.scope}`);
      })
      .catch(err => {
        console.log(`Service Worker registration failed: ${err}`);
      });
  });
}

// Update UI by printing users in the related element
const printUsers = (response) => {
  let users = document.getElementById("users");
  users.innerText = JSON.stringify(response, null, 2);
}

// Create IndexedDB (For caching the request data in the indexedDB) 
function createIndexedDB() {
  if (!('indexedDB' in window)) {return null;}
  return idb.open('usersDB', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('users')) {
      const users = upgradeDb.createObjectStore('users', {keyPath: 'code'}); // code is a unique required proprty of each user
    }
  });
}

// Get list of users from the backend
function getUsers() {
  return fetch('api/getUsers').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    
    return response.json();
  });
}

const dbPromise = createIndexedDB();

// Get users' data from the saved data in the indexedDB (For when we are offline)
function getLocalUserData() {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    return store.getAll();
  });
}

// Save the users' data in the indexedDB
function saveUserDataLocally(users) {
  if (!('indexedDB' in window)) {return null;}
  
  return dbPromise.then(db => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    if(users) {
      /* Clear the users' data before saving the new users' data
         You can omit this line if you are sure that your uniqe 'code' proprty of 
         each user wont change in future.  
       */
      store.clear();    
      
      return Promise.all(users.map(user => store.put(user)))
      .catch(() => {
        tx.abort();
        throw Error('Users were not added to the store');
      });
    }
  });
}

/* Load users' data - If we are online get it from the backend, 
 *      otherwise use the saved data in the indexedDB 
 */
 function loadContentNetworkFirst() {
  getUsers()
  .then(dataFromNetwork => {
    printUsers(dataFromNetwork);          // Print users
    saveUserDataLocally(dataFromNetwork)  // Save data in indexedDB
    .then(() => {
      console.log("Server data was saved for offline mode");
    }).catch(err => {
      console.log("Server data couldn't be saved offline :(");
      console.warn(err);
    });
  }).catch(err => { // if we can't connect to the server...
    console.log('Network requests have failed, this is expected if offline');
    getLocalUserData()
    .then(offlineData => {
      if (!offlineData.length) {
        console.log("You're offline and local data is unavailable.");
      } else {
        console.log("You're offline and viewing stored data.");
        printUsers(offlineData); 
      }
    });
  });
}