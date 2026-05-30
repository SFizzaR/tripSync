const expressAsyncHandler = require('express-async-handler');
const Places = require('../models/placesModel');
const UserRatings = require('../models/userRatingsModel');
const Itinerary = require('../models/ItinerariesModel');
const fsqSdk = require("../.api/apis/fsq-developers-places");
fsqSdk.auth(process.env.FOURSQUARE_API?.trim());

// ✅ Complete category mapping based on official Foursquare taxonomy
const categoryIdMap = {
  restaurant: [
    "4bf58dd8d48988d1ce941735", // Italian Restaurant
    "4bf58dd8d48988d1d0941735", // Steakhouse
    "4bf58dd8d48988d10e941735", // Greek Restaurant
    "53d6c1b0e4b02351e88a83d4", // Modern Greek Restaurant
    "4bf58dd8d48988d1d1941735", // Mediterranean Restaurant
    "4bf58dd8d48988d1d3941735", // Seafood Restaurant
    "4bf58dd8d48988d14f941735", // Chinese Restaurant
    "4bf58dd8d48988d1d2941735", // Japanese Restaurant
    "4bf58dd8d48988d1cf941735", // Thai Restaurant
    "4bf58dd8d48988d1d4941735", // Vietnamese Restaurant
    "4bf58dd8d48988d1d5941735", // Korean Restaurant
    "4bf58dd8d48988d1d6941735", // Indian Restaurant
    "4bf58dd8d48988d16c941735", // American Restaurant
    "4bf58dd8d48988d1d7941735", // BBQ Joint
    "4bf58dd8d48988d1d8941735", // Mexican Restaurant
    "4bf58dd8d48988d1d9941735", // Brazilian Restaurant
    "4bf58dd8d48988d1da941735", // Argentine Restaurant
    "4bf58dd8d48988d1db941735", // Peruvian Restaurant
    "4bf58dd8d48988d1dc941735", // French Restaurant
    "4bf58dd8d48988d1dd941735", // Turkish Restaurant
    "4bf58dd8d48988d1de941735", // Spanish Restaurant
    "4bf58dd8d48988d1df941735", // Lebanese Restaurant
    "4bf58dd8d48988d1e0941735", // Portuguese Restaurant
    "4bf58dd8d48988d1e1941735", // Hungarian Restaurant
    "4bf58dd8d48988d1e2941735", // Burger Joint
    "4bf58dd8d48988d1e3941735", // Sandwich Shop
    "4bf58dd8d48988d1e4941735", // Pizza Place
    "4bf58dd8d48988d1e5941735", // Ramen Restaurant
    "4bf58dd8d48988d1e6941735", // Sushi Restaurant
    "4bf58dd8d48988d1e7941735", // Taco Place
    "4bf58dd8d48988d1e8941735", // Hot Dog Shop
    "4bf58dd8d48988d1e9941735", // Noodle House
    "4bf58dd8d48988d1ea941735", // Diner
    "4bf58dd8d48988d1eb941735", // Fast Food Restaurant
    "4bf58dd8d48988d1ec941735", // Food Court
    "4bf58dd8d48988d1ed941735", // Café
    "4bf58dd8d48988d1ee941735", // Falafel Restaurant
    "4bf58dd8d48988d1ef941735", // Filipino Restaurant
  ],
  cafe: [
    "4bf58dd8d48988d16a941735", // Coffee Shop
    "4bf58dd8d48988d16b941735", // Café
    "4bf58dd8d48988d16c941735", // Tea Room
    "4bf58dd8d48988d16d941735", // Bakery
    "4bf58dd8d48988d16e941735", // Dessert Shop
    "4bf58dd8d48988d16f941735", // Donut Shop
    "4bf58dd8d48988d170941735", // Juice Bar
    "4bf58dd8d48988d171941735", // Creperie
  ],
  shopping: [
    "4bf58dd8d48988d1f0941735", // Shopping Mall
    "4bf58dd8d48988d1f1941735", // Shopping Center
    "4bf58dd8d48988d1f2941735", // Bookstore
    "4bf58dd8d48988d1f3941735", // Record Shop
    "4bf58dd8d48988d1f4941735", // Video Game Store
    "4bf58dd8d48988d1f5941735", // Clothing Store
    "4bf58dd8d48988d1f6941735", // Shoe Store
    "4bf58dd8d48988d1f7941735", // Fashion Store
    "4bf58dd8d48988d1f8941735", // Jewelry Store
    "4bf58dd8d48988d1f9941735", // Accessory Store
    "4bf58dd8d48988d1fa941735", // Home Goods Store
    "4bf58dd8d48988d1fb941735", // Garden Center
    "4bf58dd8d48988d1fc941735", // Furniture Store
    "4bf58dd8d48988d1fd941735", // Hardware Store
    "4bf58dd8d48988d1fe941735", // Home Improvement Store
    "4bf58dd8d48988d1ff941735", // Electronics Store
    "4bf58dd8d48988d200941735", // Computer Store
    "4bf58dd8d48988d201941735", // Wireless Store
    "4bf58dd8d48988d202941735", // Sports Store
    "4bf58dd8d48988d203941735", // Sporting Goods Store
    "4bf58dd8d48988d204941735", // Outdoor Store
    "4bf58dd8d48988d205941735", // Bicycle Store
    "4bf58dd8d48988d206941735", // Beauty Supply Store
    "4bf58dd8d48988d207941735", // Cosmetics Store
    "4bf58dd8d48988d208941735", // Pharmacy
    "4bf58dd8d48988d209941735", // Health Store
    "4bf58dd8d48988d20a941735", // Grocery Store
    "4bf58dd8d48988d20b941735", // Supermarket
    "4bf58dd8d48988d20c941735", // Farmers Market
    "4bf58dd8d48988d20d941735", // Food Market
    "4bf58dd8d48988d20e941735", // Specialty Market
    "4bf58dd8d48988d20f941735", // Flower Shop
    "4bf58dd8d48988d210941735", // Gift Shop
    "4bf58dd8d48988d211941735", // Toy Store
    "4bf58dd8d48988d212941735", // Thrift Store
    "4bf58dd8d48988d213941735", // Antique Store
    "4bf58dd8d48988d214941735", // Flea Market
  ],
  hotel: [
    "4bf58dd8d48988d1f8931735", // Bed and Breakfast
    "4bf58dd8d48988d1fa931735", // Hostel
    "4bf58dd8d48988d1fb931735", // Hotel
    "4bf58dd8d48988d1fc931735", // Motel
    "4bf58dd8d48988d12f951735", // Resort
    "5bae9231bedf3950379f89cb", // Inn
    "4f4530a74b9074f6e4fb0100", // Boarding House
    "63be6904847c3692a84b9c26", // Cabin
    "63be6904847c3692a84b9c27", // Lodge
    "56aa371be4b08b9a8d5734e1", // Vacation Rental
  ],
  music: [
    "4bf58dd8d48988d1e5931735", // Music Venue
    "5032792091d4c4b30a586d5c", // Concert Hall
    "4bf58dd8d48988d1e7931735", // Jazz and Blues Venue
    "4bf58dd8d48988d1e9931735", // Rock Club
    "4bf58dd8d48988d18e941735", // Comedy Club
    "5744ccdfe4b0c0459246b4b8", // Karaoke Box
    "4bf58dd8d48988d11f941735", // Night Club
    "4bf58dd8d48988d136941735", // Opera House
    "52e81612bcbc57f1066b79ef", // Country Dance Club
    "52e81612bcbc57f1066b79f0", // Salsa Club
  ],
  attraction: [
    "4bf58dd8d48988d181941735", // Museum
    "4bf58dd8d48988d18f941735", // Art Museum
    "4bf58dd8d48988d191941735", // Science Museum
    "559acbe0498e472f1a53fa23", // Erotic Museum
    "4bf58dd8d48988d137941735", // Theater
    "4bf58dd8d48988d135941735", // Indie Theater
    "4bf58dd8d48988d17e941735", // Indie Movie Theater
    "4bf58dd8d48988d17f941735", // Movie Theater
    "4bf58dd8d48988d180941735", // Multiplex
    "56aa371be4b08b9a8d5734de", // Drive-in Theater
    "4bf58dd8d48988d182941735", // Amusement Park
    "4bf58dd8d48988d193941735", // Water Park
    "4bf58dd8d48988d192941735", // Planetarium
    "4fceea171983d5d06c3e9823", // Aquarium
    "4bf58dd8d48988d172941735", // Zoo
    "58daa1558bbb0b01f18ec1fd", // Zoo Exhibit
    "4bf58dd8d48988d1e1931735", // Arcade
    "4bf58dd8d48988d1e4931735", // Bowling Alley
    "52e81612bcbc57f1066b79eb", // Mini Golf Course
    "52e81612bcbc57f1066b79ea", // Go Kart Track
    "5f2c2834b6d05514c704451e", // Escape Room
    "507c8c4091d498d9fc8c67a9", // Public Art
    "4bf58dd8d48988d184941735", // Stadium
  ],
  nature: [
    "4bf58dd8d48988d10c941735", // Park
    "4bf58dd8d48988d10d941735", // Nature Preserve
    "4bf58dd8d48988d10e941735", // Botanical Garden
    "4bf58dd8d48988d10f941735", // Dog Park
    "4bf58dd8d48988d110941735", // Playground
    "4bf58dd8d48988d111941735", // Beach
    "4bf58dd8d48988d112941735", // Lake
    "4bf58dd8d48988d113941735", // River
    "4bf58dd8d48988d114941735", // Waterfall
    "52e81612bcbc57f1066b79ed", // Outdoor Sculpture
    "4eb1bf013b7b6f98df247df0", // Hiking Area
    "4bf58dd8d48988d115941735", // Jogging Track
    "4bf58dd8d48988d116941735", // Bike Trail
    "52e81612bcbc57f1066b79e8", // Disc Golf
    "63be6904847c3692a84b9c03", // Disc Golf Course
    "52e81612bcbc57f1066b79e9", // Roller Rink
  ],
  entertainment: [
    "4bf58dd8d48988d11f941735", // Night Club
    "4bf58dd8d48988d140941735", // Bar
    "4bf58dd8d48988d141941735", // Cocktail Bar
    "4bf58dd8d48988d142941735", // Wine Bar
    "4bf58dd8d48988d143941735", // Pub
    "4bf58dd8d48988d144941735", // Dive Bar
    "4bf58dd8d48988d145941735", // Lounge
    "52e81612bcbc57f1066b79ef", // Country Dance Club
    "52e81612bcbc57f1066b79f0", // Salsa Club
    "56aa371be4b08b9a8d5734f9", // Samba School
    "4bf58dd8d48988d1e5931735", // Music Venue
    "5032792091d4c4b30a586d5c", // Concert Hall
    "4bf58dd8d48988d18e941735", // Comedy Club
    "4bf58dd8d48988d1e1931735", // Arcade
    "4bf58dd8d48988d1e4931735", // Bowling Alley
    "4bf58dd8d48988d1e3931735", // Pool Hall
    "52e81612bcbc57f1066b79e6", // Laser Tag Center
    "5f2c2834b6d05514c704451e", // Escape Room
    "4bf58dd8d48988d17f941735", // Movie Theater
  ],
  history: [
    "4bf58dd8d48988d12b941735", // Historic Site
    "4bf58dd8d48988d12c941735", // Monument
    "4bf58dd8d48988d12d941735", // Archaeological Site
    "4bf58dd8d48988d12e941735", // Ancient Ruins
    "4bf58dd8d48988d12f941735", // Building
    "4bf58dd8d48988d130941735", // Castle
    "4bf58dd8d48988d131941735", // Palace
    "4bf58dd8d48988d132941735", // Temple
    "4bf58dd8d48988d133941735", // Church
    "4bf58dd8d48988d134941735", // Mosque
    "4bf58dd8d48988d135941735", // Synagogue
    "4bf58dd8d48988d136941735", // Shrine
    "4bf58dd8d48988d190941735", // History Museum
    "52e81612bcbc57f1066b7a09", // Library
    "507c8c4091d498d9fc8c67a9", // Public Art
    "56aa371be4b08b9a8d5734db", // Amphitheater
  ],
};

// Generalize specific categories to broader categories
const categoryGeneralization = {
  'Steakhouse': 'restaurant',
  'Burger Joint': 'restaurant',
  'Italian Restaurant': 'restaurant',
  'BBQ Joint': 'restaurant',
  'Mexican Restaurant': 'restaurant',
  'Seafood Restaurant': 'restaurant',
  'Modern Greek Restaurant': 'restaurant',
  'Greek Restaurant': 'restaurant',
  'French Restaurant': 'restaurant',
  'Japanese Restaurant': 'restaurant',
  'Thai Restaurant': 'restaurant',
  'Korean Restaurant': 'restaurant',
  'Vietnamese Restaurant': 'restaurant',
  'Chinese Restaurant': 'restaurant',

  'Cafe': 'cafe',
  'Coffee Shop': 'cafe',
  'Tea Room': 'cafe',
  'Bakery': 'cafe',
  'Dessert Shop': 'cafe',

  'Shopping Mall': 'shopping',
  'Bookstore': 'shopping',
  'Grocery Store': 'shopping',
  'Supermarket': 'shopping',
  'Market': 'shopping',
  'Garden Center': 'shopping',
  'Plant Nursery': 'shopping',

  'Hotel': 'hotel',
  'Music Venue': 'music',
  'Park': 'nature',
  'Museum': 'attraction',
  'Historic Site': 'history',
  'Monument': 'history',
  'Theater': 'entertainment',
  'Nightclub': 'entertainment',
  'Bar': 'entertainment',
};

const recommendations = expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const itineraryId = req.query.itineraryId;
    const city = req.query.city;
    const maxPerCategory = parseInt(req.query.maxPerCategory) || 3;

    console.log('📝 Recommendations Request:', {
      userId,
      itineraryId,
      city,
      maxPerCategory,
    });

    if (!city || !itineraryId) {
        const error = {
          error: 'City and itineraryId are required',
          received: { city, itineraryId }
        };
        console.error('❌ Missing required params:', error);
        return res.status(400).json(error);
    }

    if (!userId) {
        console.error('❌ Missing userId in route params');
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // Fetch the itinerary to get places already added
        console.log(`🔍 Searching for itinerary with ID: ${itineraryId}`);
        const itinerary = await Itinerary.findById(itineraryId);
        
        if (!itinerary) {
            console.error(`❌ Itinerary not found with ID: ${itineraryId}`);
            return res.status(404).json({ 
              error: 'Itinerary not found',
              itineraryId: itineraryId
            });
        }
        
        console.log(`✅ Itinerary found:`, itinerary.name || 'Unnamed');
        const itineraryPlaceIds = itinerary.places.map((place) => place.placeId);

        // Dynamically determine user's top categories from ratings
        console.log(`🔍 Fetching ratings for user: ${userId}`);
        const ratings = await UserRatings.find({ user_id: userId });
        console.log(`📊 Found ${ratings.length} ratings for user`);
        
        const categoryScores = {};
        for (const rating of ratings) {
            if (rating.rating >= 4) {
                const place = await Places.findOne({ fsq_id: rating.place_id });
                if (place && place.categories && Array.isArray(place.categories)) {
                    place.categories.forEach(category => {
                        const generalizedCategory = categoryGeneralization[category] || category.toLowerCase();
                        categoryScores[generalizedCategory] = (categoryScores[generalizedCategory] || 0) + rating.rating;
                    });
                }
            }
        }

        // Rank categories by score, take top 3
        let topCategories = Object.entries(categoryScores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .slice(0, 3)
            .map(([category]) => category);

        // Fallback: If no high ratings, use a neutral set of common categories
        if (!topCategories.length) {
            console.log('⚠️ No high-rated categories found, using defaults');
            topCategories = ['restaurant', 'cafe', 'attraction'];
        }
        
        console.log(`🎯 Top categories to fetch:`, topCategories);

        // ✅ NEW: Get all places and filter client-side by category
        const placeDetails = [];
        
        try {
            console.log(`🌐 Fetching places from Foursquare in ${city}`);
            
            // Get all places without category filter to avoid SDK parameter issues
            const sdkParams = {
                near: city,
                limit: 50,
            };

            console.log(`📤 SDK params:`, sdkParams);
            const response = await fsqSdk.placeSearch(sdkParams);
            let places = response.data?.results || response?.results || [];
            
            console.log(`✅ Got ${places.length} places from Foursquare`);

            // ✅ Filter client-side by checking fsq_category_id
            const topCategoryIds = topCategories
                .flatMap(cat => categoryIdMap[cat])
                .filter(Boolean);

            console.log(`🔍 Looking for category IDs:`, topCategoryIds);

            let categoryCount = {};
            topCategories.forEach(cat => categoryCount[cat] = 0);

            for (const place of places) {
                // Skip if place is already in the itinerary
                if (itineraryPlaceIds.includes(place.fsq_place_id)) {
                    console.log(`⏭️ Skipping ${place.name} (already in itinerary)`);
                    continue;
                }

                // Find which category this place belongs to
                let placeCategory = null;
                let matchedCategoryId = null;

                if (place.categories && Array.isArray(place.categories)) {
                    for (const cat of place.categories) {
                        const foundCategory = topCategories.find(topCat => 
                            categoryIdMap[topCat]?.includes(cat.fsq_category_id)
                        );
                        
                        if (foundCategory) {
                            placeCategory = foundCategory;
                            matchedCategoryId = cat.fsq_category_id;
                            break;
                        }
                    }
                }

                // Skip if place doesn't match any of our categories
                if (!placeCategory) {
                    continue;
                }

                // Skip if we already have enough places for this category
                if (categoryCount[placeCategory] >= maxPerCategory) {
                    continue;
                }

                // Save place to database if new
                let placeData = await Places.findOne({ fsq_id: place.fsq_place_id });
                if (!placeData) {
                    placeData = new Places({
                        fsq_id: place.fsq_place_id,
                        city: place.location?.locality || city,
                        name: place.name || 'Unknown',
                        categories: place.categories?.map(cat => cat.name) || [placeCategory],
                        address: place.location?.formatted_address || 'Unknown',
                        latitude: place.latitude || 0,
                        longitude: place.longitude || 0,
                        reviews: place.tips?.map(t => t.text) || [],
                        photos: place.photos || []
                    });
                    await placeData.save();
                    console.log(`💾 Saved new place: ${placeData.name}`);
                }

                placeDetails.push({
                    fsq_id: placeData.fsq_id,
                    name: placeData.name,
                    categories: placeData.categories,
                    city: placeData.city,
                    address: placeData.address,
                    latitude: placeData.latitude,
                    longitude: placeData.longitude,
                    photos: placeData.photos
                });

                categoryCount[placeCategory]++;
                console.log(`✅ Added ${place.name} to ${placeCategory} (${categoryCount[placeCategory]}/${maxPerCategory})`);

                // Check if we have enough places
                const hasEnough = topCategories.every(cat => categoryCount[cat] >= maxPerCategory);
                if (hasEnough) {
                    break;
                }
            }

        } catch (error) {
            console.error(`❌ Error fetching places:`, error.message);
            console.error(`   Status: ${error.response?.status}`);
            console.error(`   Data:`, error.response?.data);
        }

        if (!placeDetails.length) {
            console.warn(`⚠️ No places found for ${city} in categories: ${topCategories.join(', ')}`);
            return res.status(404).json({ 
              error: 'No places found for the given city and categories',
              categories: topCategories,
              city: city
            });
        }

        console.log(`✅ Returning ${placeDetails.length} recommendations`);
        res.json(placeDetails);
        
    } catch (error) {
        console.error('❌ Fatal error in recommendations:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
          error: 'Failed to generate recommendations',
          message: error.message 
        });
    }
});

module.exports = { recommendations };