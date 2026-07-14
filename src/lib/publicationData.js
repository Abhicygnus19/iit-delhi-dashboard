const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchYearlyPublications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/yearlypublications`, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error backend! status: ${response.status}`);
    }
    const jsonResponse = await response.json();
    const data = jsonResponse.data || [];

    // console.log("yearly publication data from api", data);

    return data.map((item) => ({
      year: parseInt(item.year, 10),
      total: parseInt(item.total.replace(/,/g, ""), 10),
      foreign: parseInt(item.foreign.replace(/,/g, ""), 10),
    }));
  } catch (error) {
    console.error("Error fetching publication data:", error);
  }
};

// export const yearlyPublicationsdata = [
//   { year: 2015, total: 1970, foreign: 426 },
//   { year: 2016, total: 2259, foreign: 487 },
//   { year: 2017, total: 2654, foreign: 507 },
//   { year: 2018, total: 2729, foreign: 515 },
//   { year: 2019, total: 2923, foreign: 652 },
//   { year: 2020, total: 3293, foreign: 753 },
//   { year: 2021, total: 3609, foreign: 929 },
//   { year: 2022, total: 3994, foreign: 1100 },
//   { year: 2023, total: 4260, foreign: 1109 },
//   { year: 2024, total: 4146, foreign: 1183 },
//   { year: 2025, total: 3869, foreign: 1213 },
// ];

export const fetchPublicationData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/publicationData`, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const data = jsonResponse.data;

    if (!data || !Array.isArray(data)) return [];
    console.log("Publication data", data);

    return data.map((item) => {
      const cleanPublications = (item.publications || []).map((pub) => ({
        year: Number(pub.year),
        value:
          typeof pub.value === "string"
            ? parseInt(pub.value.replace(/,/g, ""), 10) || "No data"
            : Number(pub.value || 0),
      }));

      // Dynamically calculate cumulative total if missing from API root
      const computedTotal = cleanPublications.reduce(
        (sum, p) => sum + p.value,
        0,
      );

      return {
        code: item.code || "Unknown",
        name: item.name || "Unknown Department",
        orgType: item.orgType || "department",
        publications: cleanPublications,
        total: computedTotal || "",
        citations: item.citations || 0, // Fallback safe default
        avgLast5Years: item.avgLast5Years || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching publication data:", error);
    return [];
  }
};

// export const publicationData = [
//   {
//     code: "AM",
//     name: "Department of Applied Mechanics",
//     orgType: "department",
//     publications: [
//       {
//         year: 2015,
//         value: 52,
//         // domain: "Structural Engineering",
//         // professor: "Prof. R. Bhat",
//       },
//       {
//         year: 2016,
//         value: 59,
//       },
//       {
//         year: 2017,
//         value: 91,
//       },
//       {
//         year: 2018,
//         value: 71,
//       },
//       {
//         year: 2019,
//         value: 79,
//       },
//       {
//         year: 2020,
//         value: 69,
//       },
//       {
//         year: 2021,
//         value: 100,
//       },
//       {
//         year: 2022,
//         value: 100,
//       },
//       {
//         year: 2023,
//         value: 164,
//       },
//       {
//         year: 2024,
//         value: 148,
//       },
//       {
//         year: 2025,
//         value: 107,
//       },
//     ],
//     // total: 8,
//     citations: 14020,
//     avgLast5Years: 4.63,
//   },
//   {
//     code: "DBEB",
//     name: "Biochemical Engineering and Biotechnology",
//     orgType: "department",

//     publications: [
//       {
//         year: 2015,
//         value: 47,
//       },
//       {
//         year: 2016,
//         value: 56,
//       },
//       {
//         year: 2017,
//         value: 73,
//       },
//       {
//         year: 2018,
//         value: 66,
//       },
//       {
//         year: 2019,
//         value: 68,
//       },
//       {
//         year: 2020,
//         value: 77,
//       },
//       {
//         year: 2021,
//         value: 117,
//       },
//       {
//         year: 2022,
//         value: 140,
//       },
//       {
//         year: 2023,
//         value: 126,
//       },
//       {
//         year: 2024,
//         value: 128,
//       },
//       {
//         year: 2025,
//         value: 109,
//       },
//     ],
//     citations: 21719,
//     avgLast5Years: 7.7,
//   },
//   {
//     code: "CHE",
//     name: "Department of Chemical Engineering",
//     orgType: "department",
//     publications: [
//       {
//         year: 2015,
//         value: 98,
//       },
//       {
//         year: 2016,
//         value: 131,
//       },
//       {
//         year: 2017,
//         value: 170,
//       },
//       {
//         year: 2018,
//         value: 146,
//       },
//       {
//         year: 2019,
//         value: 153,
//       },
//       {
//         year: 2020,
//         value: 161,
//       },
//       {
//         year: 2021,
//         value: 217,
//       },
//       {
//         year: 2022,
//         value: 239,
//       },
//       {
//         year: 2023,
//         value: 228,
//       },
//       {
//         year: 2024,
//         value: 241,
//       },
//       {
//         year: 2025,
//         value: 196,
//       },
//     ],
//     citations: 43529,
//     avgLast5Years: 8.33,
//   },

//   {
//     code: "CHY",
//     name: "Department of Chemistry",
//     orgType: "department",
//     publications: [
//       {
//         year: 2015,
//         value: 106,
//       },
//       {
//         year: 2016,
//         value: 137,
//       },
//       {
//         year: 2017,
//         value: 159,
//       },
//       {
//         year: 2018,
//         value: 122,
//       },
//       {
//         year: 2019,
//         value: 157,
//       },
//       {
//         year: 2020,
//         value: 165,
//       },
//       {
//         year: 2021,
//         value: 200,
//       },
//       {
//         year: 2022,
//         value: 245,
//       },
//       {
//         year: 2023,
//         value: 261,
//       },
//       {
//         year: 2024,
//         value: 291,
//       },
//       {
//         year: 2025,
//         value: 312,
//       },
//     ],
//     citations: 43529,
//     avgLast5Years: 8.33,
//   },

//   {
//     code: "CARE",
//     name: "Centre for Applied Research in Electronics",
//     orgType: "centre",

//     publications: [
//       {
//         year: 2015,
//         value: 46,
//       },
//       {
//         year: 2016,
//         value: 51,
//       },
//       {
//         year: 2017,
//         value: 106,
//       },
//       {
//         year: 2018,
//         value: 78,
//       },
//       {
//         year: 2019,
//         value: 105,
//       },
//       {
//         year: 2020,
//         value: 84,
//       },
//       {
//         year: 2021,
//         value: 119,
//       },
//       {
//         year: 2022,
//         value: 150,
//       },
//       {
//         year: 2023,
//         value: 112,
//       },
//       {
//         year: 2024,
//         value: 105,
//       },
//       {
//         year: 2025,
//         value: 85,
//         domain: "Microelectronics",
//         professor: "Prof. D. Reddy",
//       },
//     ],
//     citations: 11557,
//     avgLast5Years: 10.5,
//   },

//   {
//     code: "CAS",
//     name: "Centre for Atmospheric Sciences",
//     orgType: "centre",

//     publications: [
//       {
//         year: 2015,
//         value: 34,
//       },
//       {
//         year: 2016,
//         value: 35,
//       },
//       {
//         year: 2017,
//         value: 29,
//       },
//       {
//         year: 2018,
//         value: 48,
//       },
//       {
//         year: 2019,
//         value: 52,
//       },
//       {
//         year: 2020,
//         value: 54,
//       },
//       {
//         year: 2021,
//         value: 65,
//       },
//       {
//         year: 2022,
//         value: 79,
//       },
//       {
//         year: 2023,
//         value: 54,
//       },
//       {
//         year: 2024,
//         value: 70,
//       },
//       {
//         year: 2025,
//         value: 82,
//       },
//     ],
//     citations: 12759,
//     avgLast5Years: 5.19,
//   },

//   {
//     code: "SBS",
//     name: "Kusuma School of Biological Sciences",
//     orgType: "school",
//     publications: [
//       {
//         year: 2015,
//         value: 38,
//       },
//       {
//         year: 2016,
//         value: 46,
//       },
//       {
//         year: 2017,
//         value: 47,
//       },
//       {
//         year: 2018,
//         value: 49,
//       },
//       {
//         year: 2019,
//         value: 60,
//       },
//       {
//         year: 2020,
//         value: 53,
//       },
//       {
//         year: 2021,
//         value: 69,
//       },
//       {
//         year: 2022,
//         value: 62,
//       },
//       {
//         year: 2023,
//         value: 77,
//       },
//       {
//         year: 2024,
//         value: 67,
//       },
//       {
//         year: 2025,
//         value: 69,
//       },
//     ],
//     citations: 9821,
//     avgLast5Years: 3.75,
//   },
// ];

// export const internationalPublicationData = [
//   {
//     year: "2015-2025",
//     internationalYear_2015to2025: [
//       { country: "United States", publications: 2592 },
//       { country: "United Kingdom", publications: 1225 },
//       { country: "Germany", publications: 938 },
//       { country: "Australia", publications: 700 },
//       { country: "Canada", publications: 534 },
//       { country: "China", publications: 495 },
//       { country: "France", publications: 474 },
//       { country: "Japan", publications: 466 },
//       { country: "South Korea", publications: 440 },
//       { country: "Saudi Arabia", publications: 363 },
//       { country: "Taiwan", publications: 361 },
//       { country: "Singapore", publications: 330 },
//     ],
//   },
// ];

export const fetchIntenationalPublication = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/internationalpublication`, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const data = jsonResponse.data; // This is the object containing { year, countries }

    if (!data || !Array.isArray(data)) return [];
    // console.log("international publication", data);
    return data.map((item) => ({
      year: item.year, // "2015-2025" then "2023-2026"
      countries: (item.countries || []).map((item) => ({
        country: item.country,
        // Convert string to clean base-10 number safely
        publications: parseInt(item.publications.replace(/,/g, ""), 10) || 0,
      })),
    }));
  } catch (error) {
    console.error("Error fetching international publication data:", error);
    return [];
  }
};
