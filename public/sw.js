// Service Worker for PWA
const CACHE_NAME = 'kaz-pwa2-v1'
const urlsToCache = [
  '/',
  '/login',
  '/admin',
]

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// フェッチ時の処理（ネットワーク優先、フォールバックでキャッシュ）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ（POST/PUT/DELETEなどはキャッシュしない）
  if (event.request.method !== 'GET') {
    return // POSTなどのリクエストはそのまま通過
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したレスポンスのみキャッシュ（エラーレスポンスはキャッシュしない）
        if (response && response.status === 200) {
          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            // 同じリクエストが既にキャッシュされている場合はスキップ
            cache.put(event.request, responseToCache).catch(() => {
              // キャッシュエラーは無視（POSTリクエストなど）
            })
          })
        }
        return response
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request)
      })
  )
})

// アクティベート時の処理（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

