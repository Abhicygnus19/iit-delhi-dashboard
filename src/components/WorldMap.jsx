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
      attributionControl: false,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });

    // Uses Esri World Street Map (Enforces English Labels & Vibrant Blue Oceans)
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

  // 2. Process dynamic mapData
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    let cancelled = false;

    const run = async () => {
      markersLayerRef.current.clearLayers();

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

      // Animated Compact Location SVG Pin Icon with 3D Shadow
      const locationPinIcon = L.divIcon({
        className: "custom-location-icon animated-pin",
        html: `
          <div class="pin-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="24" height="24">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
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

        // Smooth Camera Fly-To Zoom Effect on Location Click
        marker.on("click", () => {
          mapRef.current.flyTo(coordinates, 4, {
            animate: true,
            duration: 1.2, // 1.2-second smooth flight animation
          });
        });

        markersLayerRef.current.addLayer(marker);
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mapData, maptooltiptext]);

  return (
    <div className="mx-2 my-2 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative w-full h-[450px] z-[1] rounded-lg overflow-hidden bg-[#aadaff]">
        <div ref={mapContainerRef} className="w-full h-full" />

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
        .leaflet-control-attribution {
          display: none !important;
        }

        .custom-location-icon {
          background: transparent !important;
          border: none !important;
        }
  
        /* Animated Popup Entry */
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

// export default function WorldMap({ mapData = [], maptooltiptext = "" }) {
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
//       attributionControl: false,
//       maxBounds: [
//         [-90, -180],
//         [90, 180],
//       ],
//       maxBoundsViscosity: 1.0,
//     });

//     // Uses Esri World Street Map (Enforces English Labels & Vibrant Blue Oceans)
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

//   // 2. Process dynamic mapData
//   useEffect(() => {
//     if (!mapRef.current || !markersLayerRef.current) return;

//     let cancelled = false;

//     const run = async () => {
//       markersLayerRef.current.clearLayers();

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

//       // Compact Location SVG Pin Icon
//       const locationPinIcon = L.divIcon({
//         className: "custom-location-icon",
//         html: `
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="20" height="20" class="drop-shadow-sm">
//             <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
//           </svg>
//         `,
//         iconSize: [20, 20],
//         iconAnchor: [10, 20],
//         popupAnchor: [0, -20],
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
//   }, [mapData, maptooltiptext]);

//   return (
//     <div className="mx-4 p-2 rounded-xl border border-gray-200 shadow-sm my-4">
//       <div className="relative w-full h-[450px] z-[1] rounded-lg overflow-hidden bg-[#aadaff]">
//         <div ref={mapContainerRef} className="w-full h-full" />

//         {resolving && (
//           <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[2000] flex flex-col items-center justify-center gap-3">
//             <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//             <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
//               Loading data for countries...
//             </span>
//           </div>
//         )}
//       </div>

//       <style>{`
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .custom-location-icon {
//           background: transparent !important;
//           border: none !important;
//         }

//           /* Floating Pin Animation & 3D Shadow */
//         .animated-pin .pin-wrapper {
//           position: relative;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
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
