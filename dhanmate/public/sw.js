

const CACHE_NAME = 'dhanmate-v1';
// Note: This is a basic list. In a real build process, this would be auto-generated.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/components/Header.tsx',
  '/components/Dashboard.tsx',
  '/components/TransactionList.tsx',
  '/components/TransactionModal.tsx',
  '/components/CurrencySetupModal.tsx',
  '/components/Login.tsx',
  '/components/TermsModal.tsx',
  '/components/Goals.tsx',
  '/components/CategoryBudgets.tsx',
  '/components/AiCoach.tsx',
  '/components/SpendingChart.tsx',
  '/components/SpendingTrendsChart.tsx',
  '/components/CategoryComparisonChart.tsx',
  '/components/CameraCapture.tsx',
  '/components/VoiceInputControl.tsx',
  '/components/Navigation.tsx',
  '/components/Budget.tsx',
  '/components/travel/TravelMode.tsx',
  '/components/travel/TripDetail.tsx',
  '/components/travel/TripModal.tsx',
  '/components/travel/TripExpenseModal.tsx',
  '/components/travel/TripSummaryModal.tsx',
  '/components/icons.tsx',
  '/components/AppTutorial.tsx',
  '/services/geminiService.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/@google/genai@1.15.0',
  'https://esm.sh/recharts@2.12.7?deps=react@18.2.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs:', err);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              if (response.type !== 'opaque' && response.type !== 'cors') { // Don't cache opaque responses (e.g. from CDNs without CORS)
                return response;
              }
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't cache POST requests, etc.
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  // This focuses the app if it's open, or opens a new tab if it's not.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Prioritize focusing a visible client
      const visibleClient = clientList.find(client => client.visibilityState === 'visible');
      if (visibleClient) {
        return visibleClient.focus();
      }
      
      // If no client is visible, focus the first one on the list
      if (clientList.length > 0) {
        return clientList[0].focus();
      }

      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});