const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
import drdoimg from "../assets/drdo_logo.png";

// export const coeProjectData = [
//   {
//     title: "DRDO Industry Academia - Centre of Excellence (DIA-CoE)",
//     category: "goverment",
//     sponsoringAgency: "Defence Research & Development Organization",
//     sponsoringAgencyLink: "https://www.drdo.gov.in/drdo/",
//     coordinatorAndDepartment: "Dean (R&D) and Director, DIA-CoE (IITD)",
//     logo: drdoimg,
//   },
//   {
//     title: "ISRO Space Technology Cell",
//     category: "goverment",
//     sponsoringAgency: "Indian Space Research Organization (ISRO)",
//     sponsoringAgencyLink: "https://www.isro.gov.in/ISRO_EN/",
//     coordinatorAndDepartment:
//       "Prof. Vimlesh Pant, Centre for Atmospheric Sciences (CAS)",
//   },
//   {
//     title:
//       "Arun Duggal Centre of Excellence for Research in Climate Change and Air Pollution",
//     category: "industry",
//     sponsoringAgency: "Mr. Arun Duggal, Alumnus, IIT Delhi",
//     sponsoringAgencyLink: "#",
//     coordinatorAndDepartment:
//       "Prof. Sagnik Dey,  Centre for Atmospheric Sciences (CAS)",
//   },
//   {
//     title: "Renew Power Centre of Excellence on Energy & Environment",
//     category: "industry",
//     sponsoringAgency: "Renew Power Ventures Pvt. Ltd.",
//     sponsoringAgencyLink: "https://www.renew.com/",
//     coordinatorAndDepartment:
//       "Prof. Nilanjan Senroy, Department of Electrical Engineering",
//   },
//   {
//     title:
//       "Wadhwani Innovation Network CoE on Precision & Personalized Healthcare",
//     category: "industry/NGO",
//     sponsoringAgency: "Wadhwani Foundation",
//     sponsoringAgencyLink: "https://wadhwanifoundation.org/",
//     coordinatorAndDepartment:
//       "Prof. Neetu Singh, Centre of Biomedical Engineering",
//   },
// ];

export const fetchCoeProjectData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coe`, {
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

    // console.log("COE project data from api", jsonResponse.data);

    return (jsonResponse.data || []).map((item) => ({
      ...item,
      title: item.title,
      category: item.category,
      sponsoringAgency: item.sponsoringAgency,
      sponsoringAgencyLink: item.sponsoringAgencyLink,
      coordinatorAndDepartment: item.coordinatorAndDepartment,
      logo: item.logo,
    }));
    // return jsonResponse.data;
  } catch (error) {
    console.log("error fetching COE project data", error);
  }
};
