const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchMouData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mou`, {
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

    // console.log("MOU data from api", jsonResponse.data);

    return (jsonResponse.data || []).map((item) => ({
      ...item,
      mouSignedOrganization: item.mouSignedOrganization,
      category: item.category,
      mouSigningDate: item.mouSigningDate,
    }));
  } catch (error) {
    console.log("error fetching MOU data", error);
  }
};

// export const mouData = [
//   {
//     mouSignedOrganization:
//       "Agricultural and Processed Food Products Export Development Authority (APEDA), New Delhi",
//     category: "Government",
//     mouSigningDate: "04-03-2020",
//   },
//   {
//     mouSignedOrganization: "Mastercard Technology Private Limited, USA",
//     category: "Industry/Foreign",
//     mouSigningDate: "28-08-2020",
//   },
//   {
//     mouSignedOrganization:
//       "Daksh Society, Bengaluru (COE for Law and Technology)",
//     category: "NPO",
//     mouSigningDate: "09-10-2020",
//   },
//   {
//     mouSignedOrganization: "Hebrew University of Jerusalem, Israel (HUJI)",
//     category: "Foreign/Academic",
//     mouSigningDate: "04-01-2021",
//   },
//   {
//     mouSignedOrganization: "Ashoka University, Haryana",
//     category: "Non-Government",
//     mouSigningDate: "04-03-2021",
//   },
//   {
//     mouSignedOrganization: "The TATA Power Company Ltd., Mumbai",
//     category: "Indian-Industry",
//     mouSigningDate: "01-10-2021",
//   },
// ];

export const fetchMoaData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/moa`, {
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

    // console.log("MOA data from api", jsonResponse.data);

    return (jsonResponse.data || []).map((item) => ({
      ...item,
      universityAndOrganization: item.universityAndOrganization,
      country: item.country,
      region: item.region,
      continent: item.continent,
    }));
  } catch (error) {
    console.log("error fetching MOA data", error);
  }
};

// export const moaData = [
//   {
//     universityAndOrganization:
//       "Instituto Tecnológico de Buenos Aires (ITBA) - PhD",
//     country: "Argentina",
//     region: "South America",
//     continent: "South America",
//   },
//   {
//     universityAndOrganization:
//       "Instituto Tecnológico de Buenos Aires (ITBA) - General and UG/PG",
//     country: "Argentina",
//     region: "South America",
//     continent: "South America",
//   },
//   {
//     universityAndOrganization: "Swinburne University of Technology",
//     country: "Australia",
//     region: "Oceania",
//     continent: "Australia",
//   },
// ];
