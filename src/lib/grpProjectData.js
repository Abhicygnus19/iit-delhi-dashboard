const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// export const grpProjectData = [
//   {
//     universityName: "University College of London; UCL",
//     country: "UK",
//     totalProjects: 35,
//     grpType: "International",
//     collaborationType: "bilateral",
//   },

//   {
//     universityName: "National Yang Ming Chiao Tung University, Twain; NYCU",
//     country: "Taiwan",
//     totalProjects: 35,
//     grpType: "International",
//     collaborationType: "bilateral",
//   },
//   {
//     universityName: "Clemson University",
//     country: "US",
//     totalProjects: 3,
//     grpType: "International",
//     collaborationType: "bilateral",
//   },

//   {
//     universityName: "Hebrew University of Jerusalem, Israel (HUJI)",
//     country: "Israeil",
//     totalProjects: 24,
//     grpType: "International",
//     collaborationType: "bilateral",
//   },

//   {
//     universityName: "UCL-AIIMS-IITD",
//     country: "",
//     totalProjects: 6,
//     grpType: "International",
//     collaborationType: "trilateral",
//   },

//   {
//     universityName: "All India institute of Medical Sciences; AIIMS",
//     totalProjects: 65,
//     grpType: "National",
//   },
//   {
//     universityName: "National Institute of Immunology; NII",
//     totalProjects: 14,
//     grpType: "National",
//   },
// ];

export const fetchGrpProjectData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/grp`, {
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

    console.log("GRP projects from api", jsonResponse.data);

    return (jsonResponse.data || []).map((item) => ({
      ...item,
      universityName: item.universityName || "",
      country: item.country || "",
      totalProjects: item.totalProjects || "",
      grpType: item.grpType || "",
      collaborationType: item.collaborationType || "",
    }));
  } catch (error) {
    console.log("error fetching GRP project data", error);
  }
};
