const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchPatentsData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/patents`, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonResponse = await response.json();

    console.log("patentsData from api", jsonResponse.data);

    return (jsonResponse.data || []).map((year) => ({
      ...year,
      patentTypes: year.patentTypes.map((ptype) => ({
        ...ptype,
        patentNumbers: Number(ptype.patentNumbers),
      })),
    }));
  } catch (error) {
    console.log("Error while fetching patents data", error);
  }
};

// export const patentsData = [
//   {
//     year: "2016-17",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 72 },
//       { name: "Patents Granted", patentNumbers: 17 },
//       { name: "Technology License Deal", patentNumbers: 2 },
//     ],
//   },
//   {
//     year: "2017-18",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 103 },
//       { name: "Patents Granted", patentNumbers: 17 },
//       { name: "Technology License Deal", patentNumbers: 10 },
//     ],
//   },
//   {
//     year: "2018-19",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 120 },
//       { name: "Patents Granted", patentNumbers: 29 },
//       { name: "Technology License Deal", patentNumbers: 9 },
//     ],
//   },
//   {
//     year: "2019-20",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 173 },
//       { name: "Patents Granted", patentNumbers: 45 },
//       { name: "Technology License Deal", patentNumbers: 8 },
//     ],
//   },
//   {
//     year: "2020-21",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 140 },
//       { name: "Patents Granted", patentNumbers: 69 },
//       { name: "Technology License Deal", patentNumbers: 36 },
//     ],
//   },
//   {
//     year: "2021-22",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 137 },
//       { name: "Patents Granted", patentNumbers: 71 },
//       { name: "Technology License Deal", patentNumbers: 11 },
//     ],
//   },
//   {
//     year: "2022-23",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 116 },
//       { name: "Patents Granted", patentNumbers: 94 },
//       { name: "Technology License Deal", patentNumbers: 13 },
//     ],
//   },
//   {
//     year: "2023-24",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 101 },
//       { name: "Patents Granted", patentNumbers: 304 },
//       { name: "Technology License Deal", patentNumbers: 11 },
//     ],
//   },
//   {
//     year: "2024-25",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 151 },
//       { name: "Patents Granted", patentNumbers: 87 },
//       { name: "Technology License Deal", patentNumbers: 28 },
//     ],
//   },
//   {
//     year: "2025-26",
//     patentTypes: [
//       { name: "Patents Filed", patentNumbers: 174 },
//       { name: "Patents Granted", patentNumbers: 80 },
//       { name: "Technology License Deal", patentNumbers: 23 },
//     ],
//   },
// ];
