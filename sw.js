const cacheName = "jesenblog-cache-static";

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request).then(response => {
        if (!response || !response.ok) {
          return response;
        }

        const shouldCache = 
          /^http.+(cdn\/expire).+(\.css|\.js)$/.test(e.request.url) ||
          /^http.+(\/js\/|\/css\/|\/img\/).*(\.css|\.js|default\.png|loading\.gif)$/.test(e.request.url) ||
          /^http.+\/\d{4}\/\d\d\/\d\d\/.+\/.+\.(png|jpg|gif|jpeg|webp)$/.test(e.request.url);

        if (shouldCache) {
          const clonedResponse = response.clone();
          caches.open(cacheName).then(cache => {
            cache.put(e.request, clonedResponse);
          });
        }

        return response;
      }).catch(error => {
        console.error('Fetching failed:', error);
        throw error;
      });
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keyList => 
      Promise.all(
        keyList.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});
