const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchMenuData = async () => {
  const response = await fetch(`${API_BASE_URL}/navigation`, {
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

  if (typeof jsonResponse.data !== "string") {
    throw new Error("Navigation API did not return HTML in its data field");
  }

  return jsonResponse.data;
};
