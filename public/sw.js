// Service worker mínimo do LEVE: só torna a app instalável e dá uma página
// de reserva quando não há rede. NUNCA mete em cache pedidos que não sejam
// deste site (Supabase, fontes, etc.) — evita respostas antigas ou dados
// privados guardados por engano.

const CACHE = "leve-shell-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só navegação (abrir/atualizar uma página), do próprio site, por GET.
  if (request.method !== "GET" || request.mode !== "navigate") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(OFFLINE_URL, copy));
        return response;
      })
      .catch(() => caches.match(OFFLINE_URL)),
  );
});
