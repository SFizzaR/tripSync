from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import pandas as pd
from predict_weather import predict_weather, adjust_itinerary, city_to_station
import logging
import traceback
import json

weather_bp = Blueprint('weather', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
client = MongoClient('mongodb+srv://k224543:WafoD3Q0Vam8d36H@cluster0.1otf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['test']
itineraries_collection = db['itineraries']

@weather_bp.route('/api/weather/adjust-itinerary', methods=['POST'])
def adjust_itinerary_route():
    try:
        # Get JSON data with error handling for malformed requests
        data = request.get_json(silent=True)
        if not data:
            logger.error("No or invalid JSON data provided in request")
            return jsonify({
                'error': 'No or invalid JSON data provided. Please send a valid JSON object with an "itinerary_id" field.'
            }), 400
        
        itinerary_id = data.get('itinerary_id')
        if not itinerary_id:
            logger.error("Itinerary ID is missing")
            return jsonify({'error': 'Itinerary ID is required'}), 400
        
        # Convert itinerary_id to ObjectId with error handling
        try:
            itinerary_id = ObjectId(itinerary_id)
        except Exception as e:
            logger.error(f"Invalid itinerary ID format: {itinerary_id} - {str(e)}")
            return jsonify({'error': 'Invalid itinerary ID format'}), 400
        
        # Fetch itinerary from MongoDB
        itinerary = itineraries_collection.find_one({'_id': itinerary_id})
        if not itinerary:
            logger.error(f"Itinerary ID {itinerary_id} not found")
            return jsonify({'error': 'Itinerary not found'}), 404
        
        # Extract and parse required fields
        city_full = itinerary.get('city')
        if not city_full:
            logger.error("City field is missing")
            return jsonify({'error': 'City field is required'}), 400
        # Split city, country into just city (assuming format "City, Country")
        city = city_full.split(',')[0].strip()
        logger.info(f"Parsed city from {city_full} to {city}")
        
        start_date = itinerary.get('startDate')
        end_date = itinerary.get('endDate')
        places = itinerary.get('places', [])
        
        # Validate required fields
        if not all([city, start_date, end_date, places]):
            missing = [field for field, value in [('city', city), ('startDate', start_date), ('endDate', end_date), ('places', places)] if not value]
            logger.error(f"Missing required fields: {missing}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400
        
        # Use pre-defined city_to_station from predict_weather
        if city not in city_to_station:
            logger.error(f"City {city} not supported")
            return jsonify({'error': f"City {city} not supported"}), 400
        
        station_id = city_to_station[city]
        
        # Prepare places for adjust_itinerary by mapping placeName to activity
        adjusted_places = []
        for place in places:
            place_dict = {
                'activity': place.get('placeName', 'Unknown Activity')
            }
            adjusted_places.append(place_dict)
        
        # Predict weather using saved model
        predictions_df = predict_weather(
            station_id=station_id,
            city_name=city,
            start_date=start_date,
            end_date=end_date,
            seq_length=15
        )
        
        if predictions_df is None or predictions_df.empty:
            logger.error(f"Failed to generate predictions for {city}")
            return jsonify({'error': 'Failed to generate weather predictions'}), 500
        
        # Adjust itinerary
        adjusted_itinerary = adjust_itinerary(city, predictions_df, adjusted_places, start_date, end_date)
        
        logger.info(f"Adjusted itinerary for {city}")
        return jsonify({
            'city': city,
            'start_date': start_date,
            'end_date': end_date,
            'adjusted_itinerary': adjusted_itinerary
        }), 200
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Internal server error'}), 500