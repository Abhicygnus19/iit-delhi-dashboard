// const CACHE_KEY = "country_geocode_cache_v1";

// function loadCache() {
//   try {
//     return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
//   } catch {
//     return {};
//   }
// }

// function saveCache(cache) {
//   try {
//     localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
//   } catch {
//     // localStorage full or unavailable — safe to ignore, just no caching
//   }
// }

// const cache = loadCache();
// const inFlight = new Map(); // dedupe concurrent requests for the same country

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// /**
//  * Resolves a country name to [lat, lng] using OpenStreetMap's Nominatim
//  * geocoding API. Cached in localStorage so each country is only ever
//  * looked up once, ever (across sessions).
//  */
// export async function geocodeCountry(countryName) {
//   const key = countryName.trim().toLowerCase();
//   if (!key) return null;

//   if (cache[key]) return cache[key]; // cached hit — instant, no network call

//   if (inFlight.has(key)) return inFlight.get(key); // avoid duplicate parallel requests

//   const promise = (async () => {
//     try {
//       const url = `https://nominatim.openstreetmap.org/search?format=json&featuretype=country&country=${encodeURIComponent(
//         countryName,
//       )}&limit=1`;

//       const res = await fetch(url, {
//         headers: {
//           // Nominatim usage policy asks for an identifying User-Agent/Referer.
//           // Browsers block manual User-Agent headers, so Referer + a valid
//           // Origin (your deployed domain) is what actually satisfies this.
//           Accept: "application/json",
//         },
//       });

//       if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

//       const results = await res.json();
//       if (!results.length) {
//         console.warn(`[geocodeCountry] No result found for "${countryName}"`);
//         return null;
//       }

//       const coords = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
//       cache[key] = coords;
//       saveCache(cache);
//       return coords;
//     } catch (err) {
//       console.error(`[geocodeCountry] Error geocoding "${countryName}":`, err);
//       return null;
//     } finally {
//       inFlight.delete(key);
//     }
//   })();

//   inFlight.set(key, promise);
//   return promise;
// }

// /**
//  * Resolves a list of unique country names sequentially, respecting
//  * Nominatim's ~1 request/second rate limit. Already-cached countries
//  * resolve instantly with no delay.
//  */
// export async function geocodeCountries(countryNames) {
//   const results = {};
//   for (const name of countryNames) {
//     const key = name.trim().toLowerCase();
//     const wasCached = Boolean(cache[key]);

//     results[key] = await geocodeCountry(name);

//     if (!wasCached) {
//       await delay(1100); // only throttle on actual network calls, not cache hits
//     }
//   }
//   return results;
// }
