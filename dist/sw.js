// App da Célula — cache-first PWA shell
const CACHE = "adc-v26";
const ASSETS = [
  "./",
  "./index.html",
  "./escala.html",
  "./escalas/index.html",
  "./dinamicas.html",
  "./dinamicas/index.html",
  "./palavras.html",
  "./palavras/index.html",
  "./dinamicas.js",
  "./palavras.js",
  "./palavras-devocionais.json",
  "./styles.css",
  "./logo.css",
  "./app.js",
  "./onboarding.js",
  "./mtr-dynamics.js",
  "./daily-verses.js",
  "./manifest.json",
  "./favicon.ico",
  "./icon-16.png",
  "./icon-32.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./og-image.png",
  "./og-palavra.png",
  "./og-dinamica.png",
  "./og-escala.png",
  "./assets/app-da-celula-logo.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k)=>k!==CACHE).map((k)=>caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // only same-origin
  if (url.origin !== self.location.origin) return;
  // html — network-first fallback to cache (so deploys update)
  if (req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(fetch(req).then((r)=>{ if(r.ok){ const c=r.clone(); caches.open(CACHE).then((ch)=>ch.put(req,c)); } return r; }).catch(()=> caches.match(req).then((r)=> r || caches.match("./index.html"))));
    return;
  }
  // assets — cache-first
  e.respondWith(caches.match(req).then((hit)=> hit || fetch(req).then((r)=>{ const c=r.clone(); caches.open(CACHE).then((ch)=>ch.put(req,c)); return r; })));
});
