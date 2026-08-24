const CACHE_KEY = "country_geocode_cache_v1";

// Mapping dictionary for territories, broken encodings, and formal names
const COUNTRY_ALIASES = {
  // Territories & SARs
  "hong kong": "Hong Kong",
  macao: "Macau",
  macaust: "Macau",
  "puerto rico": "Puerto Rico",
  palestine: "Palestine",
  "french polynesia": "French Polynesia",
  "new caledonia": "New Caledonia",
  "saint martin": "Sint Maarten",

  // Name Variations
  "democratic republic congo": "Democratic Republic of the Congo",

  "democratic republic of congo": "Democratic Republic of the Congo",

  drc: "Democratic Republic of the Congo",

  usa: "United States",
  us: "United States",

  uk: "United Kingdom",

  uae: "United Arab Emirates",

  "russian federation": "Russia",

  "czech republic": "Czechia",
};

function normalizeName(countryName) {
  if (!countryName) return "";
  let clean = countryName.toString().trim().toLowerCase();

  // Strip text inside parentheses e.g. "Saint Martin (Dutch Part)" -> "saint martin"
  clean = clean.replace(/\s*\([^)]*\)/g, "").trim();

  return COUNTRY_ALIASES[clean] || countryName.trim();
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

const cache = loadCache();
const inFlight = new Map();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeCountry(countryName) {
  if (!countryName) return null;

  const rawInput = countryName.toString().trim();
  const cacheKey = rawInput.toLowerCase();

  // Ignore invalid placeholder strings
  if (!rawInput || cacheKey === "undefined" || cacheKey === "null") {
    return null;
  }

  // Check cache hit
  if (cache[cacheKey]) return cache[cacheKey];
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const resolvedName = normalizeName(rawInput);

  const promise = (async () => {
    try {
      // Step 1: Try strict country query
      let url = `https://nominatim.openstreetmap.org/search?format=json&featuretype=country&country=${encodeURIComponent(
        resolvedName,
      )}&limit=1`;

      let res = await fetch(url, { headers: { Accept: "application/json" } });
      let results = res.ok ? await res.json() : [];

      // Step 2: Fallback to general search query if featuretype=country returns empty (e.g. for Hong Kong)
      if (!results.length) {
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          resolvedName,
        )}&limit=1`;
        res = await fetch(url, { headers: { Accept: "application/json" } });
        results = res.ok ? await res.json() : [];
      }

      if (!results.length) {
        console.warn(
          `[geocodeCountry] No result found for "${rawInput}" (${resolvedName})`,
        );
        return null;
      }

      const coords = [parseFloat(results[0].lat), parseFloat(results[0].lon)];

      // Cache both original key and resolved key
      cache[cacheKey] = coords;
      cache[resolvedName.toLowerCase()] = coords;
      saveCache(cache);

      return coords;
    } catch (err) {
      console.error(`[geocodeCountry] Error geocoding "${rawInput}":`, err);
      return null;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}

export async function geocodeCountries(countryNames) {
  const results = {};
  for (const name of countryNames) {
    if (!name || name.toString().toLowerCase() === "undefined") continue;

    const key = name.toString().trim().toLowerCase();
    const wasCached = Boolean(cache[key]);

    results[key] = await geocodeCountry(name);

    if (!wasCached) {
      await delay(1100); // Respect 1s Nominatim rate limit
    }
  }
  return results;
}
