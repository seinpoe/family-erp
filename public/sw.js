const CACHE_NAME = "hearthline-public-shell-v2";
const PUBLIC_SHELL = ["/", "/icon.svg", "/manifest.webmanifest"];
const PRIVATE_PATH_PREFIXES = ["/account", "/api", "/assets", "/auth", "/dashboard", "/documents", "/family", "/finance", "/invite", "/reminders", "/schedule"];

self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PUBLIC_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim(); });
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isPrivatePath = PRIVATE_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
  const isPublicShellRequest = url.origin === self.location.origin && PUBLIC_SHELL.includes(url.pathname);

  // Household, authentication, API, and Supabase requests must always remain network-only.
  if (isPrivatePath || !isPublicShellRequest) return;

  event.respondWith(fetch(event.request).then(async (response) => {
    if (response.ok) (await caches.open(CACHE_NAME)).put(event.request, response.clone());
    return response;
  }).catch(async () => (await caches.match(event.request)) || Response.error()));
});
