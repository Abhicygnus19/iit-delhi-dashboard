import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeCountries } from "../../lib/geocodeCountry";

export default function MoaWorldMap({
  mapData = [],
  maptooltiptext = "Active Programs",
  pinColor = "blue", // Default blue
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [resolving, setResolving] = useState(false);
  const [legendRange, setLegendRange] = useState({ min: 1, max: 100 });
  const [countryGeoJson, setCountryGeoJson] = useState(null);

  // GeoJSON / API country name normalization helper
  const normalizeCountryName = (name) => {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    clean = clean.replace(/\s*\([^)]*\)/g, "").trim();

    // Russia variation
    if (clean === "russian federation" || clean === "russia") {
      return "russia";
    }

    // USA variations
    if (
      clean === "united states" ||
      clean === "usa" ||
      clean === "us" ||
      clean === "united states of america"
    ) {
      return "united states of america";
    }

    // UK variations
    if (
      clean === "uk" ||
      clean === "great britain" ||
      clean === "united kingdom"
    ) {
      return "united kingdom";
    }

    // UAE variations
    if (clean === "uae" || clean === "united arab emirates") {
      return "united arab emirates";
    }

    return clean;
  };

  // Fetch world boundaries GeoJSON
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
    )
      .then((res) => res.json())
      .then((data) => setCountryGeoJson(data))
      .catch((err) => console.error("Error loading country GeoJSON:", err));
  }, []);

  // Initialize Leaflet map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      attributionControl: false,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri" },
    ).addTo(mapRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getDeepRedColor = (ratio) => {
    if (ratio > 0.8) return "#67000d";
    if (ratio > 0.6) return "#a50f15";
    if (ratio > 0.4) return "#de2d26";
    if (ratio > 0.2) return "#fb6a4a";
    if (ratio > 0) return "#fcae91";
    return "transparent";
  };

  useEffect(() => {
    if (!mapRef.current || !countryGeoJson) return;

    let cancelled = false;

    const run = async () => {
      if (markersLayerRef.current) markersLayerRef.current.clearLayers();
      if (geoJsonLayerRef.current) {
        mapRef.current.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }

      // 1. Correctly parse API values & handle string numbers (e.g., totalProjects: "11")
      const aggregatedCountries = mapData.reduce((acc, item) => {
        const countryRaw = item.country || item.name;
        if (!countryRaw) return acc;

        const normalizedKey = normalizeCountryName(countryRaw);
        if (normalizedKey === "multiple countries") return acc;

        if (!acc[normalizedKey]) {
          acc[normalizedKey] = {
            rawName: countryRaw,
            displayName: countryRaw,
            totalCount: 0,
            institutions: [],
          };
        }

        // Support both totalProjects and value fields, converting string numbers
        const rawVal = item.totalProjects ?? item.value ?? 1;
        const parsedVal = parseInt(rawVal, 10);
        acc[normalizedKey].totalCount += isNaN(parsedVal) ? 1 : parsedVal;

        if (item.universityName || item.universityAndOrganization) {
          acc[normalizedKey].institutions.push(
            item.universityName || item.universityAndOrganization,
          );
        }

        return acc;
      }, {});

      const rawCountryNames = Object.values(aggregatedCountries).map(
        (c) => c.rawName,
      );

      if (rawCountryNames.length === 0) return;

      setResolving(true);
      const coordsByCountry = await geocodeCountries(rawCountryNames);
      setResolving(false);

      if (cancelled) return;

      let maxVal = 1;
      let minVal = Infinity;

      Object.values(aggregatedCountries).forEach((c) => {
        if (c.totalCount > maxVal) maxVal = c.totalCount;
        if (c.totalCount < minVal) minVal = c.totalCount;
      });

      setLegendRange({
        min: minVal === Infinity ? 0 : minVal,
        max: maxVal,
      });

      // 2. Render GeoJSON fill (No borders)
      geoJsonLayerRef.current = L.geoJSON(countryGeoJson, {
        style: (feature) => {
          const featureName = normalizeCountryName(feature.properties.name);
          const countryMatch = aggregatedCountries[featureName];

          if (countryMatch) {
            const count = countryMatch.totalCount;
            const ratio = count / maxVal;
            return {
              fillColor: getDeepRedColor(ratio),
              fillOpacity: 0.65,
              stroke: false,
              weight: 0,
            };
          }

          return {
            fillColor: "transparent",
            fillOpacity: 0,
            stroke: false,
            weight: 0,
          };
        },
      }).addTo(mapRef.current);

      // 3. Custom Pin Icon
      const locationPinIcon = L.divIcon({
        className: "custom-location-icon animated-pin",
        html: `
      <div class="pin-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${pinColor}" width="24" height="24">
          <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });
      // 4. Fallback lookup to find coordinates for pins reliably
      Object.keys(aggregatedCountries).forEach((normKey) => {
        const countryInfo = aggregatedCountries[normKey];
        const rawKey = countryInfo.rawName.toLowerCase().trim();

        // Check raw name, normalized name, or direct dictionary lookup
        const coordinates =
          coordsByCountry[rawKey] ||
          coordsByCountry[normKey] ||
          coordsByCountry["united states"] ||
          coordsByCountry["usa"];

        if (!coordinates) return;

        const count = countryInfo.totalCount;

        let detailsHtml = "";
        if (countryInfo.institutions.length > 0) {
          const list = countryInfo.institutions
            .map(
              (inst) =>
                `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
                   <span class="text-blue-500">•</span>
                   <span class="hover:text-blue-600 transition-colors cursor-pointer">${inst}</span>
                 </li>`,
            )
            .join("");

          detailsHtml = `<ul class="text-xs text-gray-700 mt-1.5 list-none p-0 max-h-52 overflow-y-auto pr-1">${list}</ul>`;
        }

        const marker = L.marker(coordinates, {
          icon: locationPinIcon,
          zIndexOffset: 1000,
        });

        marker.bindPopup(
          `<div>
            <strong class="text-sm text-blue-600 font-bold block">${
              countryInfo.displayName
            }</strong>
            <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">
              ${maptooltiptext}: ${count.toLocaleString()}
            </div>
            ${detailsHtml}
          </div>`,
          {
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            offset: [0, -2],
          },
        );

        markersLayerRef.current.addLayer(marker);
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mapData, maptooltiptext, countryGeoJson]);

  return (
    <div className="mx-2 my-2 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative w-full h-[550px] z-[1] rounded-lg overflow-hidden bg-[#aadaff]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading Overlay */}
        {resolving && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[2000] flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
              Loading map data...
            </span>
          </div>
        )}

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-md border border-gray-200 text-xs text-gray-700 pointer-events-auto">
          <div className="font-semibold text-[11px] text-gray-800 mb-1">
            {maptooltiptext || "Density Range"}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-500">
              {legendRange.min.toLocaleString()}
            </span>
            <div className="w-28 h-2.5 rounded-sm bg-gradient-to-r from-[#fcae91] via-[#de2d26] to-[#67000d] border border-gray-200/50" />
            <span className="font-medium text-gray-900">
              {legendRange.max.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-control-attribution {
          display: none !important;
        }

        .custom-location-icon {
          background: transparent !important;
          border: none !important; 
        }

        .leaflet-popup {
          animation: popupFlyIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popupFlyIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// import { useEffect, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { geocodeCountries } from "../../lib/geocodeCountry";

// export default function MoaWorldMap({ MoaData = [] }) {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markersLayerRef = useRef(null);
//   const [resolving, setResolving] = useState(false);

//   // 1. Initialize Leaflet map once
//   useEffect(() => {
//     if (!mapContainerRef.current || mapRef.current) return;

//     mapRef.current = L.map(mapContainerRef.current, {
//       center: [25, 10],
//       zoom: 2,
//       minZoom: 2,
//       maxZoom: 6,
//       attributionControl: false,
//       maxBounds: [
//         [-90, -180],
//         [90, 180],
//       ],
//       maxBoundsViscosity: 1.0,
//     });

//     // Enforces English continent names and rich blue oceans (Original Tile)
//     L.tileLayer(
//       "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
//       { attribution: "Tiles &copy; Esri" },
//     ).addTo(mapRef.current);

//     markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // 2. Group by country, geocode dynamically, plot markers with popups
//   useEffect(() => {
//     if (!mapRef.current || !markersLayerRef.current) return;

//     let cancelled = false;

//     const run = async () => {
//       markersLayerRef.current.clearLayers();

//       const aggregatedCountries = MoaData.reduce((acc, item) => {
//         if (!item.country) return acc;
//         const key = item.country.toLowerCase().trim();
//         if (key === "multiple countries") return acc;

//         if (!acc[key]) {
//           acc[key] = { displayName: item.country, institutions: [] };
//         }
//         if (item.universityAndOrganization) {
//           acc[key].institutions.push(item.universityAndOrganization);
//         }
//         return acc;
//       }, {});

//       const uniqueCountryNames = Object.values(aggregatedCountries).map(
//         (c) => c.displayName,
//       );

//       if (uniqueCountryNames.length === 0) return;

//       setResolving(true);
//       const coordsByCountry = await geocodeCountries(uniqueCountryNames);
//       setResolving(false);

//       if (cancelled) return;

//       // Original SVG Location Pin Icon with Animated Wrapper Class
//       const locationPinIcon = L.divIcon({
//         className: "custom-location-icon animated-pin",
//         html: `
//           <div class="pin-wrapper">
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="24" height="24">
//               <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
//             </svg>
//             <div class="pin-shadow"></div>
//           </div>
//         `,
//         iconSize: [24, 24],
//         iconAnchor: [12, 24],
//         popupAnchor: [0, -24],
//       });

//       Object.keys(aggregatedCountries).forEach((countryKey) => {
//         const coordinates = coordsByCountry[countryKey];
//         if (!coordinates) return;

//         const countryInfo = aggregatedCountries[countryKey];
//         const count = countryInfo.institutions.length;

//         const institutionListHtml = countryInfo.institutions
//           .map(
//             (inst) =>
//               `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
//                  <span class="text-blue-500">•</span>
//                  <span class="hover:text-blue-600 transition-colors cursor-pointer">${inst}</span>
//                </li>`,
//           )
//           .join("");

//         const marker = L.marker(coordinates, {
//           icon: locationPinIcon,
//           zIndexOffset: 1000,
//         });

//         marker.bindPopup(
//           `<div class="p-0.5">
//             <strong class="text-sm text-blue-600 font-bold block">${countryInfo.displayName}</strong>
//             <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">Active Programs: ${count}</div>
//             <ul class="text-xs text-gray-700 mt-1.5 list-none p-0 max-h-52 overflow-y-auto pr-1">
//               ${institutionListHtml}
//             </ul>
//           </div>`,
//           {
//             closeButton: true,
//             autoClose: true,
//             closeOnClick: true,
//             offset: [0, -2],
//           },
//         );

//         markersLayerRef.current.addLayer(marker);
//       });
//     };

//     run();

//     return () => {
//       cancelled = true;
//     };
//   }, [MoaData]);

//   return (
//     <div className="w-full   bg-gray-50  rounded-xl border border-gray-200 mb-6 overflow-hidden">
//       <div className="p-4 flex justify-between items-center flex-wrap gap-3  ">
//         <h3 className="text-base font-semibold text-gray-900">
//           Global Collaboration Network (Select a country)
//         </h3>
//         <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
//           {resolving
//             ? "Resolving locations…"
//             : "Select Countries to view details"}
//         </span>
//       </div>

//       {/* 3D Perspective Viewport */}
//       <div className="w-full h-[550px] rounded-lg overflow-hidden bg-[#aadaff]">
//         <div ref={mapContainerRef} className="w-full h-full" />
//       </div>

//       <style>{`
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .custom-location-icon {
//           background: transparent !important;
//           border: none !important;
//         }

//         /* Animated Smooth Popup Entry */
//         .leaflet-popup {
//           animation: popupFlyIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//         }

//         @keyframes popupFlyIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px) scale(0.9);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0) scale(1);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
