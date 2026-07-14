const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchStudentSchemeData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentscheme`, {
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
    console.log("Student Scheme Data Project Data", jsonResponse.data);

    return (jsonResponse.data || []).map((schemeName) => ({
      ...schemeName,
      yearlyData: schemeName.yearlyData.map((yearlyData) => ({
        ...yearlyData,
        year: Number(yearlyData.year),
        count: Number(yearlyData.count),
      })),
    }));
  } catch (error) {
    console.error("Error fetching Student SchemeData data:", error);
  }
};

// export const studentSchemeData = [
//   {
//     schemeName: "Student Startup Action",
//     yearlyData: [
//       { "year": 2017, count: 4 },
//       { "year": 2018, count: 3 },
//       { "year": 2019, count: 5 },
//       { "year": 2020, count: 9 },
//       { "year": 2021, count: 3 },
//       { "year": 2023, count: 6 },
//       { "year": 2024, count: 1 },
//       { "year": 2025, count: 1 },
//       { "year": 2026, count: 3 },
//     ],
//   },
//   {
//     schemeName: "Discover & Learn",
//     yearlyData: [
//       { "year": 2017, count: 10 },
//       { "year": 2018, count: 8 },
//       { "year": 2019, count: 3 },
//       { "year": 2020, count: 11 },
//       { "year": 2021, count: 5 },
//       { "year": 2024, count: 10 },
//       { "year": 2025, count: 9 },
//       { "year": 2026, count: 5 },
//     ],
//   },
//   {
//     schemeName: "SURA",
//     yearlyData: [
//       { "year": 2016, count: 30 },
//       { "year": 2017, count: 27 },
//       { "year": 2018, count: 30 },
//       { "year": 2019, count: 30 },
//       { "year": 2021, count: 34 },
//       { "year": 2022, count: 24 },
//       { "year": 2023, count: 28 },
//       { "year": 2024, count: 26 },
//       { "year": 2025, count: 28 },
//     ],
//   },
// ];
