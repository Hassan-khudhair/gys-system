// ─────────────────────────────────────────────────────────────────────────────
// FitNex Admin — Service Worker v5
//
// Caching strategies:
//   /_next/static/*     → Cache-First  (content-hashed, safe to keep forever)
//   images / fonts      → Cache-First  (long-lived static assets)
//   page navigations    → Network-First → stale cache → /offline.html
//   manifest.json       → Network-only (browser manages natively; never SW-cache)
//   RSC / API / dynamic → Network-only (never cache)
//
// Update flow:
//   1. Browser re-fetches /sw.js on every page load (updateViaCache: "none").
//   2. If the file changed, a new SW is installed while the old one runs.
//   3. The client sends SKIP_WAITING, new SW activates and claims all tabs.
//   4. Old caches (any name ≠ CACHE) are wiped in the activate handler.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE   = 'fitnex-admin-v5';
const OFFLINE = '/offline.html';

// Only pre-cache the bare minimum needed to show the offline page.
// Keeping this list short prevents install failure (cache.addAll is atomic —
// one bad URL aborts the whole install and leaves the user without a SW).
const PRECACHE = [
  OFFLINE,
  '/icon.svg',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Messages ──────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ── Skip: Next.js RSC (React Server Component) data requests ───────────────
  // These carry internal headers and must always come from the network.
  // Serving a stale RSC payload causes hydration errors and broken navigation.
  if (
    request.headers.get('RSC') === '1' ||
    request.headers.get('rsc') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('Next-Router-State-Tree') !== null
  ) {
    return;
  }

  // ── Skip: Next.js image optimisation endpoint ───────────────────────────────
  if (url.pathname.startsWith('/_next/image')) return;

  // ── Skip: API routes ────────────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) return;

  // ── Skip: Web App Manifest — browser manages manifest caching natively ──────
  // Never SW-cache the manifest: a stale or malformed cached copy blocks PWA
  // installability and survives cache version bumps.
  if (url.pathname === '/manifest.json') return;

  // ── Cache-First: Next.js static chunks (immutable content-hashed names) ─────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Cache-First: static assets (images, fonts, icons, offline page) ─────────
  if (
    url.pathname === '/offline.html'  ||
    /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Network-First: page navigations ────────────────────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNav(request));
    return;
  }

  // Everything else (analytics, HMR WebSocket upgrades, etc.) — network only.
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    // Fire-and-forget — don't block the response on the write.
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNav(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache the fresh page shell so it's available offline.
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network unavailable — try the cached version of this exact URL.
    const cached = await cache.match(request);
    if (cached) return cached;

    // No cached version — show the branded offline page.
    const offline = await cache.match(OFFLINE);
    if (offline) return offline;

    // Last resort: inline HTML (offline.html wasn't pre-cached yet).
    return new Response(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>FitNex — Offline</title>' +
      '<style>body{margin:0;display:flex;align-items:center;justify-content:center;' +
      'min-height:100dvh;background:#030d10;color:#d6eef2;font-family:system-ui,sans-serif;text-align:center}' +
      'h1{font-size:1.1rem;margin-bottom:.5rem}p{color:#5e99a8;font-size:.85rem}</style></head>' +
      '<body><div><h1>لا يوجد اتصال</h1><p>No Internet Connection</p>' +
      '<button onclick="location.reload()" style="margin-top:1.5rem;padding:.6rem 1.5rem;' +
      'background:#00748e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:.875rem">' +
      'إعادة المحاولة · Retry</button></div></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
