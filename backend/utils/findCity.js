const API_KEY = "d6948130e9324f0cbb7943a72377a363";
const API_URL = "https://api.opencagedata.com/geocode/v1/json";

/**
 * Fetch city name from latitude & longitude
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} City name
 */
async function fetchCityFromCoordinates(latitude, longitude) {
    const fetch = (await import("node-fetch")).default; // ✅ Dynamic Import for CommonJS

    try {
        const query = `${latitude},${longitude}`;
        const requestUrl = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&pretty=1&no_annotations=1`;

        const response = await fetch(requestUrl);
        const data = await response.json();

        if (response.status !== 200) {
            console.error("Error:", data.status.message);
            throw new Error(`Geocoding API error: ${data.status.message}`);
        }

        // ✅ Define components before using
        const components = data.results[0]?.components;

        // ✅ Prioritize city, then town, village, and state_district
        let city = data.results[0]?.components?.city ||
            data.results[0]?.components?.town ||
            data.results[0]?.components?.village ||
            data.results[0]?.components?.state_district ||
            data.results[0]?.components?.state ||
            "Unknown City";

        // Remove "Division" or "Capital Territory" if present
        city = city.replace(/\s*(Division|Capital Territory)$/i, "");

        return city;

    } catch (error) {
        console.error("Error fetching city:", error.message);
        throw error;
    }
}

module.exports = { fetchCityFromCoordinates };
