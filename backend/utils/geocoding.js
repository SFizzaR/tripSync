const API_KEY = "d6948130e9324f0cbb7943a72377a363";
const API_URL = "https://api.opencagedata.com/geocode/v1/json";

const opencage = require('opencage-api-client');

const getCoordinates = async (cityName) => {
    try {
        const data = await opencage.geocode({
            q: cityName,
            key: API_KEY, // Use environment variable
        });
        if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            return {
                lat: place.geometry.lat,
                lng: place.geometry.lng,
            };
        } else {
            console.log("No results found.");
            return null;
        }
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
};


async function fetchCityFromCoordinates(latitude, longitude) {
    const fetch = (await import("node-fetch")).default;

    try {
        const query = `${latitude},${longitude}`;
        const requestUrl = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&pretty=1&no_annotations=1`;

        const response = await fetch(requestUrl);
        const data = await response.json();

        if (response.status !== 200) {
            console.error("Error:", data.status.message);
            throw new Error(`Geocoding API error: ${data.status.message}`);
        }


        const components = data.results[0]?.components;


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

const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Earth's radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};


module.exports = { fetchCityFromCoordinates, getCoordinates, getDistance };
