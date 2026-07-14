// import { useEffect, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { geocodeCountries } from "../../lib/geocodeCountry";

// export default function WorldMap({ MoaData = [] }) {
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
//       maxBounds: [
//         [-90, -180],
//         [90, 180],
//       ],
//       maxBoundsViscosity: 1.0,
//     });

//     L.tileLayer(
//       "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
//       { attribution: "&copy; OpenStreetMap &copy; CARTO" },
//     ).addTo(mapRef.current);

//     markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // 2. Whenever API data changes: group by country, geocode dynamically, plot
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

//       console.log("[WorldMap] Countries to plot:", uniqueCountryNames); // TEMP debug line

//       if (uniqueCountryNames.length === 0) {
//         console.warn(
//           "[WorldMap] No countries found in MoaData — nothing to plot.",
//         );
//         return;
//       }

//       setResolving(true);
//       const coordsByCountry = await geocodeCountries(uniqueCountryNames);
//       setResolving(false);

//       console.log("[WorldMap] Resolved coordinates:", coordsByCountry); // TEMP debug line

//       if (cancelled) return;

//       const glowingIcon = L.divIcon({
//         className: "glowing-marker",
//         html: `<div class="pin-glow-outer"></div><div class="pin-glow"></div><div class="pin-core"></div>`,
//         iconSize: [44, 44], // was [34, 34] — bigger to fit the deeper pulse
//         iconAnchor: [22, 22], // half of iconSize
//       });

//       Object.keys(aggregatedCountries).forEach((countryKey) => {
//         const coordinates = coordsByCountry[countryKey];
//         if (!coordinates) return;

//         const countryInfo = aggregatedCountries[countryKey];
//         const count = countryInfo.institutions.length;

//         const institutionListHtml = countryInfo.institutions
//           .slice(0, 3)
//           .map((inst) => `<li>• ${inst}</li>`)
//           .join("");
//         const remainder =
//           count > 3 ? `<li>• ...and ${count - 3} more</li>` : "";

//         const marker = L.marker(coordinates, {
//           icon: glowingIcon,
//           zIndexOffset: 1000,
//         });

//         marker.bindTooltip(
//           `<div class="p-1">
//             <strong class="text-sm text-blue-600">${countryInfo.displayName}</strong>
//             <div class="text-xs text-gray-500 font-semibold mt-0.5">Active Programs: ${count}</div>
//             <ul class="text-xs text-gray-700 mt-1.5 list-none p-0">${institutionListHtml}${remainder}</ul>
//           </div>`,
//           { direction: "top", offset: [0, -10] },
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
//     <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
//       <div className="flex justify-between items-center mb-3">
//         <h3 className="text-base font-semibold text-gray-900">
//           Global Operational MOAs
//         </h3>
//         <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
//           {resolving ? "Resolving locations…" : "Live Map Pins Active"}
//         </span>
//       </div>
//       <div
//         ref={mapContainerRef}
//         className="w-full h-[450px] rounded-lg overflow-hidden bg-[#f8fafc]"
//       />

//       {/* Leaflet injects marker HTML outside React's tree, so these classes
//           MUST be plain global CSS — Tailwind classes here would be silently
//           dropped since this DOM is never processed by React/Tailwind's JIT. */}
//       <style>{`
//         .glowing-marker {
//           background: transparent;
//           border: none;
//         }
//         .pin-core {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           width: 10px;
//           height: 10px;
//           background: #2563eb;
//           border: 2px solid #ffffff;
//           border-radius: 50%;
//           transform: translate(-50%, -50%);
//           box-shadow: 0 0 8px 2px rgba(37, 99, 235, 0.9);
//           z-index: 2;
//         }
//         .pin-glow {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           width: 10px;
//           height: 10px;
//           background: rgba(37, 99, 235, 0.5);
//           border-radius: 50%;
//           transform: translate(-50%, -50%);
//           animation: pin-pulse-anim 1.8s ease-out infinite;
//           z-index: 1;
//         }
//         @keyframes pin-pulse-anim {
//           0%   { width: 10px; height: 10px; opacity: 0.6; }
//           70%  { width: 34px; height: 34px; opacity: 0; }
//           100% { width: 34px; height: 34px; opacity: 0; }
//         }
//       `}</style>
//     </div>
//   );
// }
