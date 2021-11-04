/*
Copyright 2015, 2019, 2020, 2021 Google LLC. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
// This variable is intentionally declared and unused.
// Add a comment for your linter if you want:
// eslint-disable-next-line no-unused-vars
const ORIGIN_URL = `${location.protocol}//${location.host}`;
const CACHE_NAME = "offline-v2";
const OFFLINE_URL = "offline.html";
const CACHED_FILES = [
  OFFLINE_URL,
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
  `${ORIGIN_URL}/js/index.js`,
  `${ORIGIN_URL}/img/logo.png`,
  `${ORIGIN_URL}/img/logos/car-logo.png`,
  `${ORIGIN_URL}/img/offline_car.png`,
];
/** FUNCTIONS */

/** Fetch */

const sendOfflinePage = (resolve) => {
  caches.open(CACHE_NAME).then((cache) => {
    cache.match(OFFLINE_URL).then((cachedResponse) => {
      resolve(cachedResponse);
    });
  });
};

const respondWithFetchPromiseNavigate = (event) =>
  new Promise((resolve) => {
    event.preloadResponse
      .then((preloadResponse) => {
        if (preloadResponse) {
          resolve(preloadResponse);
        }

        // Always try the network first.
        fetch(event.request)
          .then((networkResponse) => {
            resolve(networkResponse);
          })
          // send cache offline.html
          .catch(() => sendOfflinePage(resolve));
      })
      .catch(() => sendOfflinePage(resolve));
  });

const fetchSW = (event) => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === "navigate") {
    event.respondWith(respondWithFetchPromiseNavigate(event));
  } else if (CACHED_FILES.includes(event.request.url)) {
    event.respondWith(caches.match(event.request));
  }
};

/*********************************** */

/** Activate */
const deleteOldCaches = () =>
  new Promise((resolve) => {
    caches.keys().then((keys) => {
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            caches.delete(key);
          }
        })
      ).finally(resolve);
    });
  });

const waitUntilActivatePromise = () =>
  new Promise((resolve) => {
    deleteOldCaches().then(() => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        self.registration.navigationPreload.enable().finally(resolve);
      }
    });
  });

const activate = (event) => {
  event.waitUntil(waitUntilActivatePromise());
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
};

/*********************************** */

/** Install */
const waitUntilInstallationPromise = () =>
  new Promise((resolve) => {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(CACHED_FILES).then(resolve);
    });
  });

const installSW = (event) => {
  event.waitUntil(waitUntilInstallationPromise());
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
};
/*********************************** */

/** INIT */
self.addEventListener("install", installSW);
self.addEventListener("activate", activate);
self.addEventListener("fetch", fetchSW);