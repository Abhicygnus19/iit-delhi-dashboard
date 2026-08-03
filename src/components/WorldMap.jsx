import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeCountries } from "../lib/geocodeCountry";

export default function WorldMap({ mapData = [], maptooltiptext = "" }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [resolving, setResolving] = useState(false);

  // 1. Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OpenStreetMap &copy; CARTO" },
    ).addTo(mapRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Process dynamic mapData
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    let cancelled = false;

    const run = async () => {
      markersLayerRef.current.clearLayers();

      // Flexible aggregation to support both Publication objects ({name, value}) and MOA objects ({country, universityAndOrganization})
      const aggregatedCountries = mapData.reduce((acc, item) => {
        const countryRaw = item.country || item.name;
        if (!countryRaw) return acc;

        const key = countryRaw.toLowerCase().trim();
        if (key === "multiple countries") return acc;

        if (!acc[key]) {
          acc[key] = {
            displayName: countryRaw,
            totalCount: 0,
            institutions: [],
          };
        }

        // Handle publication value counts vs individual institution entries
        if (typeof item.value === "number") {
          acc[key].totalCount += item.value;
        } else {
          acc[key].totalCount += 1;
        }

        if (item.universityAndOrganization) {
          acc[key].institutions.push(item.universityAndOrganization);
        }

        return acc;
      }, {});

      const uniqueCountryNames = Object.values(aggregatedCountries).map(
        (c) => c.displayName,
      );

      if (uniqueCountryNames.length === 0) return;

      setResolving(true);
      const coordsByCountry = await geocodeCountries(uniqueCountryNames);
      setResolving(false);

      if (cancelled) return;

      const glowingIcon = L.divIcon({
        className: "glowing-marker",
        html: `<div class="pin-glow-outer"></div><div class="pin-glow"></div><div class="pin-core"></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      Object.keys(aggregatedCountries).forEach((countryKey) => {
        const coordinates = coordsByCountry[countryKey];
        if (!coordinates) return;

        const countryInfo = aggregatedCountries[countryKey];
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
          icon: glowingIcon,
          zIndexOffset: 1000,
        });

        // Use bindPopup with autoClose: true to ensure only 1 stays open at a time
        marker.bindPopup(
          `<div>
            <strong class="text-sm text-blue-600 font-bold block">${countryInfo.displayName}</strong>
            <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">
              
              ${
                countryInfo.institutions.length > 0
                  ? `${maptooltiptext}`
                  : `${maptooltiptext}`
              }: ${count.toLocaleString()}
            </div>
            ${detailsHtml}
          </div>`,
          {
            closeButton: true,
            autoClose: true, // Auto-closes any previously open popup
            closeOnClick: true, // Closes popup when clicking elsewhere on the map
            offset: [0, -10],
          },
        );

        markersLayerRef.current.addLayer(marker);
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mapData]);

  return (
    <div className="mx-4 p-2 rounded-xl border border-gray-200 shadow-sm my-4">
      {/* Container wrapper position relative for absolute loader positioning */}
      <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-[#f8fafc]">
        {/* Leaflet map div */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* In-Map Loader Overlay */}
        {resolving && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[2000] flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
              Loading data for countries...
            </span>
          </div>
        )}
      </div>

      <style>{`
        .glowing-marker {
          background: transparent;
          border: none;
        }
        .pin-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: #2563eb;
          border: 2px solid #ffffff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px 2px rgba(37, 99, 235, 0.9);
          z-index: 2;
          cursor: pointer;
        }
        .pin-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: rgba(37, 99, 235, 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pin-pulse-anim 1.8s ease-out infinite;
          z-index: 1;
        }
        @keyframes pin-pulse-anim {
          0%   { width: 10px; height: 10px; opacity: 0.6; }
          70%  { width: 34px; height: 34px; opacity: 0; }
          100% { width: 34px; height: 34px; opacity: 0; }
        }
 
      `}</style>
    </div>
  );
}

// ${countryInfo.institutions.length > 0 ? "Active Programs" : "Total Publications"}: ${count.toLocaleString()}
// import { useEffect, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { geocodeCountries } from "../lib/geocodeCountry";

// export default function WorldMap({ mapData = [] }) {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markersLayerRef = useRef(null);
//   const [resolving, setResolving] = useState(false);

//   // 1. Initialize Leaflet map instance once
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

//   // 2. Process dynamic mapData
//   useEffect(() => {
//     if (!mapRef.current || !markersLayerRef.current) return;

//     let cancelled = false;

//     const run = async () => {
//       markersLayerRef.current.clearLayers();

//       // Flexible aggregation to support both Publication objects ({name, value}) and MOA objects ({country, universityAndOrganization})
//       const aggregatedCountries = mapData.reduce((acc, item) => {
//         const countryRaw = item.country || item.name;
//         if (!countryRaw) return acc;

//         const key = countryRaw.toLowerCase().trim();
//         if (key === "multiple countries") return acc;

//         if (!acc[key]) {
//           acc[key] = {
//             displayName: countryRaw,
//             totalCount: 0,
//             institutions: [],
//           };
//         }

//         // Handle publication value counts vs individual institution entries
//         if (typeof item.value === "number") {
//           acc[key].totalCount += item.value;
//         } else {
//           acc[key].totalCount += 1;
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

//       const glowingIcon = L.divIcon({
//         className: "glowing-marker",
//         html: `<div class="pin-glow-outer"></div><div class="pin-glow"></div><div class="pin-core"></div>`,
//         iconSize: [44, 44],
//         iconAnchor: [22, 22],
//       });

//       Object.keys(aggregatedCountries).forEach((countryKey) => {
//         const coordinates = coordsByCountry[countryKey];
//         if (!coordinates) return;

//         const countryInfo = aggregatedCountries[countryKey];
//         const count = countryInfo.totalCount;

//         let detailsHtml = "";
//         if (countryInfo.institutions.length > 0) {
//           const list = countryInfo.institutions
//             .map(
//               (inst) =>
//                 `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
//                    <span class="text-blue-500">•</span>
//                    <span class="hover:text-blue-600 transition-colors cursor-pointer">${inst}</span>
//                  </li>`,
//             )
//             .join("");

//           detailsHtml = `<ul class="text-xs text-gray-700 mt-1.5 list-none p-0 max-h-52 overflow-y-auto pr-1">${list}</ul>`;
//         }

//         const marker = L.marker(coordinates, {
//           icon: glowingIcon,
//           zIndexOffset: 1000,
//         });

//         // Use bindPopup with autoClose: true to ensure only 1 stays open at a time
//         marker.bindPopup(
//           `<div>
//             <strong class="text-sm text-blue-600 font-bold block">${countryInfo.displayName}</strong>
//             <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">
//               ${countryInfo.institutions.length > 0 ? "Active Programs" : "Total Publications"}: ${count.toLocaleString()}
//             </div>
//             ${detailsHtml}
//           </div>`,
//           {
//             closeButton: true,
//             autoClose: true, // Auto-closes any previously open popup
//             closeOnClick: true, // Closes popup when clicking elsewhere on the map
//             offset: [0, -10],
//           },
//         );

//         markersLayerRef.current.addLayer(marker);
//       });
//     };

//     run();

//     return () => {
//       cancelled = true;
//     };
//   }, [mapData]);

//   return (
//     <div className="mx-4 p-4 rounded-xl border border-gray-200 shadow-sm my-4">
//       <div className="flex items-center justify-between mb-3">
//         <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
//           {resolving
//             ? "Resolving map coordinates..."
//             : "Click pins to view details"}
//         </span>
//       </div>

//       <div
//         ref={mapContainerRef}
//         className="w-full h-[450px] rounded-lg overflow-hidden bg-[#f8fafc]"
//       />

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
//           cursor: pointer;
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
