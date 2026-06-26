const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const consultancyProjectData = [
  {
    year: "2017-18",
    types: [
      { name: "government", projects: 91, budget: 10.27 },
      { name: "industry", projects: 213, budget: 14.62 },
      { name: "foreign", projects: 13, budget: 5.64 },
    ],
  },
  {
    year: "2018-19",
    types: [
      { name: "government", projects: 97, budget: 16.43 },
      { name: "industry", projects: 233, budget: 22.82 },
      { name: "foreign", projects: 9, budget: 3.79 },
    ],
  },
  {
    year: "2019-20",
    types: [
      { name: "government", projects: 86, budget: 11.3 },
      { name: "industry", projects: 238, budget: 13.41 },
      { name: "foreign", projects: 7, budget: 1.2 },
    ],
  },
];

export const fetchConsultancyProjectData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/consultancyprojects`, {
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

    // console.log("Consultancy project data", jsonResponse);

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

export const consultancyUnitProeject = [
  {
    year: "April 2025 to March 2026",
    consultancyUnitWiseProjects: [
      {
        academicUnit: "Centre for Biomedical Engineering",
        NoOfProjects: 22,
        SanctionedFunds: 1.12,
        consultancyType: "Centre",
      },
      {
        academicUnit: "Dept. of Applied Mechanics",
        NoOfProjects: 18,
        SanctionedFunds: 1.1,
        consultancyType: "Department",
      },
    ],
  },
];

export const fetchConsultancyUnitProject = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/consultancysanctionedprojects`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error backend! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const rawDataConsultancy = jsonResponse.data || [];

    console.log("Consultancy Unit Project data from api", rawDataConsultancy);

    return rawDataConsultancy.map((yearObj) => {
      // Find the array property dynamically (e.g., "april2025toMarch2026")
      const targetArrayKey = Object.keys(yearObj).find((key) =>
        Array.isArray(yearObj[key]),
      );

      const fullProjectListConsultancy = targetArrayKey
        ? yearObj[targetArrayKey]
        : [];

      return {
        year: yearObj.year,
        consultancyUnitWiseProjects: fullProjectListConsultancy.map((unit) => ({
          academicUnit: unit.academicUnit,
          NoOfProjects: Number(unit.NoOfProjects || 0),
          SanctionedFunds: Number(unit.SanctionedFunds || 0),
          consultancyType: unit.consultancyType || "Others",
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching consultancy project data:", error);
  }
};
