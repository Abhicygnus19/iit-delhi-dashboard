import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeCountries } from "../lib/geocodeCountry";

export default function WorldMap({
  mapData = [],
  filelink,
  maptooltiptext = "Projects",
  pinColor = "blue",
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

    if (clean === "tanzania") return "united republic of tanzania";
    if (clean === "russian federation" || clean === "russia") return "russia";
    if (
      clean === "united states" ||
      clean === "usa" ||
      clean === "us" ||
      clean === "united states of america"
    )
      return "united states of america";
    if (clean === "uk") return "united kingdom";
    if (clean === "uae") return "united arab emirates";

    return clean;
  };

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
    )
      .then((res) => res.json())
      .then((data) => setCountryGeoJson(data))
      .catch((err) => console.error("Error loading country GeoJSON:", err));
  }, []);

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

        const rawVal = item.totalProjects ?? item.value ?? 1;
        const parsedVal = parseInt(rawVal, 10);
        acc[normalizedKey].totalCount += isNaN(parsedVal) ? 1 : parsedVal;

        // AFTER
        if (item.universityName || item.universityAndOrganization) {
          acc[normalizedKey].institutions.push({
            name: item.universityName || item.universityAndOrganization,
            filelink: item.filelink || "#",
          });
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

      Object.keys(aggregatedCountries).forEach((normKey) => {
        const countryInfo = aggregatedCountries[normKey];
        const rawKey = countryInfo.rawName.toLowerCase().trim();

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
            .map((inst) => {
              let targetUrl = null;

              // Determine valid URL
              if (typeof filelink === "function") {
                const resolved = filelink(inst.name, countryInfo.displayName);
                if (resolved && resolved !== "#") targetUrl = resolved;
              } else if (inst.filelink && inst.filelink !== "#") {
                targetUrl = inst.filelink;
              } else if (typeof filelink === "string" && filelink !== "#") {
                targetUrl = filelink;
              }

              // Render <a> tag if valid link exists, otherwise plain <span>
              const content = targetUrl
                ? `<a
             href="${targetUrl}"
             target="_blank"
             rel="noopener noreferrer"
             class="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
           >
             ${inst.name}
           </a>`
                : `<span  class="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">${inst.name}</span>`;

              return `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
        <span class="text-blue-500">•</span>
        ${content} 
      </li>`;
            })
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
  }, [mapData, maptooltiptext, filelink, pinColor, countryGeoJson]);

  return (
    <div className="mx-2 my-2 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative w-full h-[550px] z-[1] rounded-lg overflow-hidden bg-[#aadaff]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {resolving && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[2000] flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
              Loading map data...
            </span>
          </div>
        )}

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
// import { geocodeCountries } from "../lib/geocodeCountry";

// export default function WorldMap({
//   mapData = [],
//   informationlink,
//   maptooltiptext = "Projects",
//   pinColor = "blue",
// }) {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const geoJsonLayerRef = useRef(null);
//   const markersLayerRef = useRef(null);
//   const [resolving, setResolving] = useState(false);
//   const [legendRange, setLegendRange] = useState({ min: 1, max: 100 });
//   const [countryGeoJson, setCountryGeoJson] = useState(null);

//   // GeoJSON / API country name normalization helper
//   const normalizeCountryName = (name) => {
//     if (!name) return "";
//     let clean = name.toLowerCase().trim();
//     clean = clean.replace(/\s*\([^)]*\)/g, "").trim();

//     if (clean === "tanzania") return "united republic of tanzania";
//     if (clean === "russian federation" || clean === "russia") return "russia";
//     if (
//       clean === "united states" ||
//       clean === "usa" ||
//       clean === "us" ||
//       clean === "united states of america"
//     )
//       return "united states of america";
//     if (
//       clean === "uk" ||
//       clean === "great britain" ||
//       clean === "united kingdom"
//     )
//       return "united kingdom";
//     if (clean === "uae" || clean === "united arab emirates")
//       return "united arab emirates";

//     return clean;
//   };

//   useEffect(() => {
//     fetch(
//       "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
//     )
//       .then((res) => res.json())
//       .then((data) => setCountryGeoJson(data))
//       .catch((err) => console.error("Error loading country GeoJSON:", err));
//   }, []);

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

//   useEffect(() => {
//     if (!mapRef.current || !countryGeoJson) return;

//     let cancelled = false;

//     const run = async () => {
//       if (markersLayerRef.current) markersLayerRef.current.clearLayers();
//       if (geoJsonLayerRef.current) {
//         mapRef.current.removeLayer(geoJsonLayerRef.current);
//         geoJsonLayerRef.current = null;
//       }

//       const aggregatedCountries = mapData.reduce((acc, item) => {
//         const countryRaw = item.country || item.name;
//         if (!countryRaw) return acc;

//         const normalizedKey = normalizeCountryName(countryRaw);
//         if (normalizedKey === "multiple countries") return acc;

//         if (!acc[normalizedKey]) {
//           acc[normalizedKey] = {
//             rawName: countryRaw,
//             displayName: countryRaw,
//             totalCount: 0,
//             institutions: [],
//           };
//         }

//         const rawVal = item.totalProjects ?? item.value ?? 1;
//         const parsedVal = parseInt(rawVal, 10);
//         acc[normalizedKey].totalCount += isNaN(parsedVal) ? 1 : parsedVal;

//        if (item.universityName || item.universityAndOrganization) {
//          acc[normalizedKey].institutions.push({
//          name: item.universityName || item.universityAndOrganization,
//          filelink: item.filelink || "#",
//         });
//        }

//         return acc;
//       }, {});

//       const rawCountryNames = Object.values(aggregatedCountries).map(
//         (c) => c.rawName,
//       );

//       if (rawCountryNames.length === 0) return;

//       setResolving(true);
//       const coordsByCountry = await geocodeCountries(rawCountryNames);
//       setResolving(false);

//       if (cancelled) return;

//       let maxVal = 1;
//       let minVal = Infinity;

//       Object.values(aggregatedCountries).forEach((c) => {
//         if (c.totalCount > maxVal) maxVal = c.totalCount;
//         if (c.totalCount < minVal) minVal = c.totalCount;
//       });

//       setLegendRange({
//         min: minVal === Infinity ? 0 : minVal,
//         max: maxVal,
//       });

//       // GeoJSON layer maintained without heat color fills
//       geoJsonLayerRef.current = L.geoJSON(countryGeoJson, {
//         style: () => ({
//           fillColor: "transparent",
//           fillOpacity: 0,
//           stroke: false,
//           weight: 0,
//         }),
//       }).addTo(mapRef.current);

//       const locationPinIcon = L.divIcon({
//         className: "custom-location-icon animated-pin",
//         html: `
//           <div class="pin-wrapper">
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${pinColor}" width="24" height="24">
//               <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
//             </svg>
//           </div>
//         `,
//         iconSize: [24, 24],
//         iconAnchor: [12, 24],
//         popupAnchor: [0, -24],
//       });

//       Object.keys(aggregatedCountries).forEach((normKey) => {
//         const countryInfo = aggregatedCountries[normKey];
//         const rawKey = countryInfo.rawName.toLowerCase().trim();

//         const coordinates =
//           coordsByCountry[rawKey] ||
//           coordsByCountry[normKey] ||
//           coordsByCountry["united states"] ||
//           coordsByCountry["usa"];

//         if (!coordinates) return;

//         const count = countryInfo.totalCount;

//         let detailsHtml = "";

// if (countryInfo.institutions.length > 0) {
//   const list = countryInfo.institutions
//     .map((inst) => {
//       let targetUrl = null;

//       // Determine valid URL
//       if (typeof filelink === "function") {
//         const resolved = filelink(inst.name, countryInfo.displayName);
//         if (resolved && resolved !== "#") targetUrl = resolved;
//       } else if (inst.filelink && inst.filelink !== "#") {
//         targetUrl = inst.filelink;
//       } else if (typeof filelink === "string" && filelink !== "#") {
//         targetUrl = filelink;
//       }

//       // Render <a> tag if valid link exists, otherwise plain <span>
//       const content = targetUrl
//         ? `<a
//              href="${targetUrl}"
//              target="_blank"
//              rel="noopener noreferrer"
//              class="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
//            >
//              ${inst.name}
//            </a>`
//         : `<span  class="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">${inst.name}</span>`;

//       return `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
//         <span class="text-blue-500">•</span>
//         ${content}
//       </li>`;
//     })
//     .join("");

//   detailsHtml = `<ul class="text-xs text-gray-700 mt-1.5 list-none p-0 max-h-52 overflow-y-auto pr-1">${list}</ul>`;
// }

//         const marker = L.marker(coordinates, {
//           icon: locationPinIcon,
//           zIndexOffset: 1000,
//         });

//         marker.bindPopup(
//           `<div>
//             <strong class="text-sm text-blue-600 font-bold block">${
//               countryInfo.displayName
//             }</strong>
//             <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">
//               ${maptooltiptext}: ${count.toLocaleString()}
//             </div>
//             ${detailsHtml}
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
//   }, [mapData, maptooltiptext, informationlink, pinColor, countryGeoJson]);

//   return (
//     <div className="mx-2 my-2 rounded-xl border border-gray-200 shadow-sm">
//       <div className="relative w-full h-[550px] z-[1] rounded-lg overflow-hidden bg-[#aadaff]">
//         <div ref={mapContainerRef} className="w-full h-full" />

//         {resolving && (
//           <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[2000] flex flex-col items-center justify-center gap-3">
//             <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//             <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
//               Loading map data...
//             </span>
//           </div>
//         )}

//         {/* Updated simplified legend without the heat spectrum */}
//         {/* <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-md border border-gray-200 text-xs text-gray-700 pointer-events-auto">
//           <div className="font-semibold text-[11px] text-gray-800 mb-1">
//             {maptooltiptext || "Range"}
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="font-medium text-gray-500">
//               Min: {legendRange.min.toLocaleString()}
//             </span>
//             <span className="text-gray-300">|</span>
//             <span className="font-medium text-gray-900">
//               Max: {legendRange.max.toLocaleString()}
//             </span>
//           </div>
//         </div> */}
//       </div>

//       <style>{`
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .custom-location-icon {
//           background: transparent !important;
//           border: none !important;
//         }

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
