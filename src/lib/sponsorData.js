const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchSponsorProjectData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sponsoredprojects`, {
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
    console.log("Sponsor Project Data", jsonResponse.data);

    return (jsonResponse.data || []).map((year) => ({
      ...year,
      types: year.types.map((type) => ({
        ...type,
        budget: Number(type.budget),
        projects: Number(type.projects),
      })),
    }));
  } catch (error) {
    console.error("Error fetching sponsor projectData data:", error);
    return [];
  }
};

export const sponsorProjectData = [
  {
    year: "2016-17",
    types: [
      { name: "government", projects: 133, budget: 130.9 },
      { name: "industry", projects: 12, budget: 72.27 },
      { name: "foreign", projects: 19, budget: 38.81 },
    ],
  },
  {
    year: "2017-18",
    types: [
      { name: "government", projects: 251, budget: 395.24 },
      { name: "industry", projects: 15, budget: 8.01 },
      { name: "foreign", projects: 20, budget: 15.34 },
    ],
  },
  {
    year: "2018-19",
    types: [
      { name: "government", projects: 294, budget: 327.92 },
      { name: "industry", projects: 24, budget: 24.92 },
      { name: "foreign", projects: 12, budget: 7.81 },
    ],
  },
  {
    year: "2019-20",
    types: [
      { name: "government", projects: 255, budget: 312.37 },
      { name: "industry", projects: 24, budget: 8.69 },
      { name: "foreign", projects: 16, budget: 22.92 },
    ],
  },
  {
    year: "2020-21",
    types: [
      { name: "government", projects: 194, budget: 131.29 },
      { name: "industry", projects: 36, budget: 29.81 },
      { name: "foreign", projects: 24, budget: 25.67 },
    ],
  },
  {
    year: "2021-22",
    types: [
      { name: "government", projects: 223, budget: 303.21 },
      { name: "industry", projects: 32, budget: 40.36 },
      { name: "foreign", projects: 25, budget: 12.25 },
    ],
  },
  {
    year: "2022-23",
    types: [
      { name: "government", projects: 220, budget: 204.4 },
      { name: "industry", projects: 59, budget: 21.65 },
      { name: "foreign", projects: 30, budget: 36.4 },
    ],
  },
  {
    year: "2023-24",
    types: [
      { name: "government", projects: 250, budget: 330.7 },
      { name: "industry", projects: 91, budget: 88.07 },
      { name: "foreign", projects: 44, budget: 31.59 },
    ],
  },
  {
    year: "2024-25",
    types: [
      { name: "government", projects: 264, budget: 331.36 },
      { name: "industry", projects: 103, budget: 52.32 },
      { name: "foreign", projects: 55, budget: 34.33 },
    ],
  },
  {
    year: "2025-26",
    types: [
      { name: "government", projects: 247, budget: 499.37 },
      { name: "industry", projects: 59, budget: 28.46 },
      { name: "foreign", projects: 31, budget: 90.5 },
    ],
    sanctionedProjectsSRP: [
      {
        academicUnit:
          "Bharti School of Telecommunication Technology & Management",
        NoOfProjects: 4,
        SanctionedFunds: 3.56,
        SRPType: "Centre",
      },
      {
        academicUnit: "Dept. of Applied Mechanics",
        NoOfProjects: 8,
        SanctionedFunds: 3.63,
        SRPType: "Department",
      },
    ],
  },
];

export const fetchSanctionedResearchProject = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sanctionedprojects`, {
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
    const rawData = jsonResponse.data || [];

    // console.log("sanctioned research project data from api", rawData);

    return rawData.map((yearObj) => {
      // Find the array property dynamically (e.g., "april2025toMarch2026")
      const targetArrayKey = Object.keys(yearObj).find((key) =>
        Array.isArray(yearObj[key]),
      );

      const fullProjectList = targetArrayKey ? yearObj[targetArrayKey] : [];

      return {
        year: yearObj.year,
        sanctionedProjectsSRP: fullProjectList.map((unit) => ({
          academicUnit: unit.academicUnit,
          NoOfProjects: Number(unit.NoOfProjects || 0),
          SanctionedFunds: Number(unit.SanctionedFunds || 0),
          SRPType: unit.SRPType || "Others",
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching sanctioned research project data:", error);
  }
};

// export const sanctionedResearchProject = [
//   {
//     year: "April 2025 to March 2026",
//     sanctionedProjectsSRP: [
//       {
//         academicUnit:
//           "Bharti School of Telecommunication Technology & Management",
//         NoOfProjects: 4,
//         SanctionedFunds: 3.56,
//         SRPType: "Centre",
//       },
//       {
//         academicUnit: "Central Library",
//         NoOfProjects: 2,
//         SanctionedFunds: 0.24,
//         SRPType: "Centre",
//       },
//       {
//         academicUnit: "Centre for Applied Research in Electronics (CARE)",
//         NoOfProjects: 8,
//         SanctionedFunds: 6.26,
//         SRPType: "Centre",
//       },
//       {
//         academicUnit: "Centre for Atmospheric Sciences",
//         NoOfProjects: 10,
//         SanctionedFunds: 7.44,
//         SRPType: "Centre",
//       },
// {
//   academicUnit: "Dept. of Applied Mechanics",
//   NoOfProjects: 8,
//   SanctionedFunds: 3.63,
//   SRPType: "Department",
// },

//       {
//         academicUnit: "School of Biological Sciences",
//         NoOfProjects: 14,
//         SanctionedFunds: 3.82,
//         SRPType: "School",
//       },
//     ],
//   },
// ];
