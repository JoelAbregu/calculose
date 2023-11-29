'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "b253004f5dba4cff1f6d8992d0ecca07",
"index.html": "d62b7cc40fb5b1e69fba1a67ad282f30",
"/": "d62b7cc40fb5b1e69fba1a67ad282f30",
"main.dart.js": "bb1d4700d51e02cddf98bc99b0ea8024",
"flutter.js": "7a1d76a8729d1add7a6ce2a4b4db043f",
"favicon.png": "997c215eda9fec9724759f8454c380c2",
"icons/Icon-192.png": "639d144688fe248e76129e0c2fa333be",
"icons/Icon-maskable-192.png": "639d144688fe248e76129e0c2fa333be",
"icons/Icon-maskable-512.png": "58edbc5235483faaec8c134a7715fea3",
"icons/Icon-512.png": "58edbc5235483faaec8c134a7715fea3",
"manifest.json": "11cb22b389dbdfe1d25d577497d5457f",
"assets/AssetManifest.json": "970638cecc607586e414b922a402a579",
"assets/NOTICES": "96d19bebf9fdc7c44534ac109402145d",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "8da35dde58fd6352e4239a3476ca585f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "9a0fb6926374d315d93491cfaa78c43a",
"assets/fonts/MaterialIcons-Regular.otf": "176048e01878186745ac87a0e9b29631",
"assets/assets/correlacional.png": "e0a3a96467f3a419870250b88baccab1",
"assets/assets/icon.png": "7f3849a0baae4e68cdd7090dae07c790",
"assets/assets/m.png": "7a8592a52bdae4bd1bb985b0b8446ff9",
"assets/assets/descriptivosconcepto2.png": "8c4aadf4c56eec076bce40af251d457c",
"assets/assets/integrantes.png": "69f8ccdf04f139aea820ccf0ccb500ab",
"assets/assets/inicio.png": "24fad7f2acac32b4de87f095a8e03cc7",
"assets/assets/descriptivosconcepto1.png": "74f5ff03eb18e1c972f65e5ca4cf9045",
"assets/assets/carga.png": "9e05c8568efd07e70d1ce223db338621",
"assets/assets/comparativo.png": "419ab752aaa005e0278feb9864c9d508",
"assets/assets/dc.png": "d2e944cd139c5c2b0e4f90b012e372a9",
"assets/assets/descriptivo_poblacion.png": "d568c7bbd99a6c22efe2648bdb2124e0",
"assets/assets/descriptivosmenu.png": "f9456db6fcc9ae9ca930bf4c882d74ba",
"assets/assets/logoow.png": "34397dd08e7c0a1f47a3efa9dc37ddc5",
"assets/assets/comparativomenu.png": "ca0212cb70e89d2cdf3459847d8b9deb",
"canvaskit/skwasm.js": "411f776c9a5204d1e466141767f5a8fa",
"canvaskit/skwasm.js.symbols": "36607a151127e3736083d241f6e7356b",
"canvaskit/canvaskit.js.symbols": "34eb740000df15c03210028f34bc9cf5",
"canvaskit/skwasm.wasm": "045364c77c9eedecbd12d2c77fe8fa0a",
"canvaskit/chromium/canvaskit.js.symbols": "afe994e4d3d6d23db1d643573c9839ce",
"canvaskit/chromium/canvaskit.js": "bc979fce6b4b3cc75d54b0d162cafaa7",
"canvaskit/chromium/canvaskit.wasm": "1ec8ac7ed8ea5906c2e03fc14cb2c22a",
"canvaskit/canvaskit.js": "321aa0c874f6112cabafc27a74a784b4",
"canvaskit/canvaskit.wasm": "2778fe4a13eac805b37df04590085ba3",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
