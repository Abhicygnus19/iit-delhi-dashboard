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
//       attributionControl: false, // Disables bottom-right Leaflet attribution text
//       maxBounds: [
//         [-90, -180],
//         [90, 180],
//       ],
//       maxBoundsViscosity: 1.0,
//     });

//     // Enforces English continent names and rich blue oceans
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

//       // Compact SVG Location Pin Icon
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
//           `<div>
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
//     <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
//       <div className="flex justify-between items-center flex-wrap mb-3">
//         <h3 className="text-base font-semibold text-gray-900">
//           Global Collaboration Network (Select a country)
//         </h3>
//         <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
//           {resolving
//             ? "Resolving locations…"
//             : "Select Countries to view details"}
//         </span>
//       </div>
//       <div
//         ref={mapContainerRef}
//         className="w-full h-[450px] rounded-lg overflow-hidden bg-[#aadaff]"
//       />

//       <style>{`
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .custom-location-icon {
//           background: transparent !important;
//           border: none !important;
//         }
//       `}</style>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeCountries } from "../../lib/geocodeCountry";

export default function MoaWorldMap({ MoaData = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [resolving, setResolving] = useState(false);

  // 1. Initialize Leaflet map once
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

    // Enforces English continent names and rich blue oceans (Original Tile)
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

  // 2. Group by country, geocode dynamically, plot markers with popups
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    let cancelled = false;

    const run = async () => {
      markersLayerRef.current.clearLayers();

      const aggregatedCountries = MoaData.reduce((acc, item) => {
        if (!item.country) return acc;
        const key = item.country.toLowerCase().trim();
        if (key === "multiple countries") return acc;

        if (!acc[key]) {
          acc[key] = { displayName: item.country, institutions: [] };
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

      // Original SVG Location Pin Icon with Animated Wrapper Class
      const locationPinIcon = L.divIcon({
        className: "custom-location-icon animated-pin",
        html: `
          <div class="pin-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="24" height="24">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            <div class="pin-shadow"></div>
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
        const count = countryInfo.institutions.length;

        const institutionListHtml = countryInfo.institutions
          .map(
            (inst) =>
              `<li class="py-1 border-b border-gray-100 last:border-none flex items-center gap-1.5">
                 <span class="text-blue-500">•</span> 
                 <span class="hover:text-blue-600 transition-colors cursor-pointer">${inst}</span>
               </li>`,
          )
          .join("");

        const marker = L.marker(coordinates, {
          icon: locationPinIcon,
          zIndexOffset: 1000,
        });

        marker.bindPopup(
          `<div class="p-0.5">
            <strong class="text-sm text-blue-600 font-bold block">${countryInfo.displayName}</strong>
            <div class="text-xs text-gray-500 font-semibold mt-0.5 border-b pb-1">Active Programs: ${count}</div>
            <ul class="text-xs text-gray-700 mt-1.5 list-none p-0 max-h-52 overflow-y-auto pr-1">
              ${institutionListHtml}
            </ul>
          </div>`,
          {
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            offset: [0, -2],
          },
        );

        // Smooth 3D Fly-To Animation on Marker Click
        marker.on("click", () => {
          mapRef.current.flyTo(coordinates, 4, {
            animate: true,
            duration: 1.2,
          });
        });

        markersLayerRef.current.addLayer(marker);
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [MoaData]);

  return (
    <div className="w-full   bg-gray-50  rounded-xl border border-gray-200 mb-6 overflow-hidden">
      <div className="p-4 flex justify-between items-center flex-wrap gap-3  ">
        <h3 className="text-base font-semibold text-gray-900">
          Global Collaboration Network (Select a country)
        </h3>
        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
          {resolving
            ? "Resolving locations…"
            : "Select Countries to view details"}
        </span>
      </div>

      {/* 3D Perspective Viewport */}
      <div className="w-full h-[450px] rounded-lg overflow-hidden bg-[#aadaff]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <style>{`
        .leaflet-control-attribution {
          display: none !important;
        }

        .custom-location-icon {
          background: transparent !important;
          border: none !important;
        }
  
        /* Animated Smooth Popup Entry */
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
