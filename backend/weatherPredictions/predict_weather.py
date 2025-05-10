import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import RobustScaler
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError
import json
import pickle
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from tensorflow.keras.saving import register_keras_serializable
@register_keras_serializable()
def mse(y_true, y_pred):
    return MeanSquaredError()(y_true, y_pred)

with open('cities_with_coords.json', 'r', encoding='utf-8') as f:
    cities = json.load(f)

city_to_station = {city['city']: city['station_id'] for city in cities}
station_to_city = {station_id: city for city, station_id in city_to_station.items()}

# Expanded category mapping with indoor/outdoor classification
CATEGORY_MAPPING = {
    'restaurant': {
        'ids': ['13065', '13377', '13298'],
        'type': 'indoor',
        'default_activity': 'Restaurant Visit',
        'keywords': ['grill', 'flavors', 'kitchen', 'dining', 'cafe', 'bistro']
    },
    'music': {
        'ids': ['10039'],
        'type': 'indoor',
        'default_activity': 'Music Event',
        'keywords': ['sound', 'studio', 'music', 'concert']
    },
    'cafe': {
        'ids': ['13032', '13383'],
        'type': 'indoor',
        'default_activity': 'Cafe Visit',
        'keywords': ['coffee', 'tea', 'bakery']
    },
    'hotel': {
        'ids': ['19014'],
        'type': 'indoor',
        'default_activity': 'Hotel Stay',
        'keywords': ['hotel', 'resort', 'lodge']
    },
    'shopping': {
        'ids': ['17069', '17070'],
        'type': 'indoor',
        'default_activity': 'Shopping Mall Visit',
        'keywords': ['mall', 'shop', 'store', 'market']
    },
    'attraction': {
        'ids': ['10000', '12042'],
        'type': 'mixed',
        'default_activity': 'Attraction Tour',
        'keywords': ['tour', 'attraction', 'landmark']
    },
    'nature': {
        'ids': ['16011', '16032'],
        'type': 'outdoor',
        'default_activity': 'Nature Visit',
        'keywords': ['park', 'garden', 'beach', 'desert', 'nature']
    },
    'entertainment': {
        'ids': ['19016', '10039', '19046'],
        'type': 'indoor',
        'default_activity': 'Entertainment Event',
        'keywords': ['fun', 'world', 'theme', 'entertainment', 'cinema']
    },
    'history': {
        'ids': ['10030', '10027', '12003', '12106', '12108'],
        'type': 'indoor',
        'default_activity': 'Museum Visit',
        'keywords': ['museum', 'heritage', 'history', 'village', 'cultural']
    },
    'art': {
        'ids': ['10031', '12004'],
        'type': 'indoor',
        'default_activity': 'Art Gallery Visit',
        'keywords': ['art', 'artisans', 'gallery', 'studio', 'pavilion', 'cube']
    },
    'cultural': {
        'ids': ['12005', '12107'],
        'type': 'mixed',
        'default_activity': 'Cultural Site Visit',
        'keywords': ['cultural', 'heritage', 'traditional', 'village']
    }
}

INDOOR_CATEGORIES = [cat for cat, info in CATEGORY_MAPPING.items() if info['type'] == 'indoor']

def get_climate_zone(lat):
    if abs(lat) < 15:
        return 1, 0, 0  # Tropical
    elif 20 <= abs(lat) <= 30:
        return 0, 1, 0  # Desert
    else:
        return 0, 0, 1  # Temperate

def get_temperature_thresholds(city_data, month):
    """
    Compute city-specific temperature thresholds for the given month.
    Returns (lower_threshold, upper_threshold) in Celsius based on mean ± 2 * std.
    """
    # Filter data for the specified month
    month_data = city_data[city_data['DATE'].dt.month == month].copy()
    if month_data.empty:
        logger.warning(f"No data for month {month}. Using default thresholds.")
        return 10, 32  # Default thresholds
    
    # Convert TAVG from Fahrenheit to Celsius
    month_data['TAVG_C'] = (month_data['TAVG'] - 32) * 5 / 9
    
    # Compute mean and standard deviation
    mean_tavg = month_data['TAVG_C'].mean()
    std_tavg = month_data['TAVG_C'].std()
    
    # Use mean ± 2 * std for thresholds, with reasonable bounds
    lower_threshold = max(mean_tavg - 2 * std_tavg, -10)  # Avoid unrealistically low thresholds
    upper_threshold = min(mean_tavg + 2 * std_tavg, 45)   # Avoid unrealistically high thresholds
    
    logger.info(f"Temperature thresholds for month {month}: {lower_threshold:.1f}°C to {upper_threshold:.1f}°C")
    return lower_threshold, upper_threshold

def predict_weather(station_id, city_name, start_date, end_date, seq_length=30):
    if city_name not in city_to_station or city_to_station[city_name] != station_id:
        logger.error(f"Invalid city {city_name} or station_id {station_id}")
        return None

    model_dir = 'weather_model'
    model_path = os.path.join(model_dir, f'lstm_model_{city_name.lower().replace(" ", "_")}.keras')
    scaler_path = os.path.join(model_dir, f'scaler_{city_name.lower().replace(" ", "_")}.pkl')
    
    if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
        logger.error(f"Model or scaler not found for {city_name} at {model_path} or {scaler_path}")
        return None
    
    logger.info(f"Loading model and scaler for {city_name}...")
    try:
        model = load_model(model_path, custom_objects={'mse': mse})
        with open(scaler_path, 'rb') as f:
            scaler_y = pickle.load(f)
        scaler_X = RobustScaler()
        logger.info(f"Successfully loaded model and target scaler for {city_name}")
        logger.warning(f"No feature scaler found for {city_name}. Fitting a new scaler, which may reduce prediction accuracy.")
    except Exception as e:
        logger.error(f"Failed to load model or scaler for {city_name}: {str(e)}")
        return None
    
    data = pd.read_csv('all_stations.csv')
    data['DATE'] = pd.to_datetime(data['DATE'])
    
    logger.info(f"Filtering data for {city_name} (Station ID: {station_id})...")
    city_data = data[data['station_id'] == station_id].copy()
    if city_data.empty:
        logger.warning(f"No data available for {city_name} (Station ID: {station_id})")
        return None
    
    city_data = city_data.sort_values('DATE')
    
    numeric_cols = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM']
    for col in numeric_cols:
        if col in ['PRCP', 'SNOW']:
            city_data[col] = city_data[col].fillna(0)
        else:
            city_data[col] = city_data[col].interpolate(method='linear', limit_direction='both')
    
    for col in numeric_cols:
        lower, upper = city_data[col].quantile([0.05, 0.95])
        city_data[col] = city_data[col].clip(lower=lower, upper=upper)
    
    city_data['PRCP'] = np.log1p(city_data['PRCP'])
    city_data['SNOW'] = np.log1p(city_data['SNOW'])
    
    city_data['DAY_OF_YEAR'] = city_data['DATE'].dt.dayofyear
    city_data['DAY_OF_YEAR_SIN'] = np.sin(2 * np.pi * city_data['DAY_OF_YEAR'] / 365.25)
    city_data['DAY_OF_YEAR_COS'] = np.cos(2 * np.pi * city_data['DAY_OF_YEAR'] / 365.25)
    city_data['MONTH'] = city_data['DATE'].dt.month
    city_data['MONTH_SIN'] = np.sin(2 * np.pi * city_data['MONTH'] / 12)
    city_data['MONTH_COS'] = np.cos(2 * np.pi * city_data['MONTH'] / 12)
    city_data['YEAR'] = city_data['DATE'].dt.year
    city_data['TREND'] = (city_data['YEAR'] - city_data['YEAR'].min()) / (city_data['YEAR'].max() - city_data['YEAR'].min())
    
    lat = next(item['lat'] for item in cities if item['city'] == city_name)
    is_tropical, is_desert, is_temperate = get_climate_zone(lat)
    city_data['IS_TROPICAL'] = is_tropical
    city_data['IS_DESERT'] = is_desert
    city_data['IS_TEMPERATE'] = is_temperate
    
    for col in numeric_cols:
        for lag in range(1, 4):
            city_data[f'{col}_LAG{lag}'] = city_data[col].shift(lag)
        city_data[f'{col}_ROLLING_MEAN_7D'] = city_data[col].shift(1).rolling(window=7).mean()
        city_data[f'{col}_ROLLING_STD_7D'] = city_data[col].shift(1).rolling(window=7).std()
    
    city_data = city_data.dropna()
    
    features = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM', 'DAY_OF_YEAR_SIN', 'DAY_OF_YEAR_COS',
                'MONTH_SIN', 'MONTH_COS', 'TREND', 'IS_TROPICAL', 'IS_DESERT', 'IS_TEMPERATE',
                'TAVG_LAG1', 'PRCP_LAG1', 'SNOW_LAG1', 'AWND_LAG1', 'RHUM_LAG1',
                'TAVG_LAG2', 'PRCP_LAG2', 'SNOW_LAG2', 'AWND_LAG2', 'RHUM_LAG2',
                'TAVG_LAG3', 'PRCP_LAG3', 'SNOW_LAG3', 'AWND_LAG3', 'RHUM_LAG3',
                'TAVG_ROLLING_MEAN_7D', 'PRCP_ROLLING_MEAN_7D', 'SNOW_ROLLING_MEAN_7D', 'AWND_ROLLING_MEAN_7D', 'RHUM_ROLLING_MEAN_7D',
                'TAVG_ROLLING_STD_7D', 'PRCP_ROLLING_STD_7D', 'SNOW_ROLLING_STD_7D', 'AWND_ROLLING_STD_7D', 'RHUM_ROLLING_STD_7D']
    targets = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM']
    
    scaled_data = scaler_X.fit_transform(city_data[features])
    scaled_df = pd.DataFrame(scaled_data, columns=features, index=city_data.index)
    
    try:
        start_date = pd.to_datetime(start_date).date()
        end_date = pd.to_datetime(end_date).date()
        start_date = pd.to_datetime(start_date)
        end_date = pd.to_datetime(end_date)
    except ValueError as e:
        logger.error(f"Invalid date format for start_date {start_date} or end_date {end_date}: {str(e)}")
        return None

    if end_date < start_date:
        logger.error(f"End date {end_date} must be after start date {start_date}")
        return None
    
    forecast_days = (end_date - start_date).days + 1
    last_data_date = city_data['DATE'].max()
    days_to_bridge = (start_date - last_data_date).days
    
    last_sequence = scaled_df[features].iloc[-seq_length:].values
    historical_data = city_data[features].iloc[-seq_length:].copy()
    predictions = []
    
    current_date = last_data_date + timedelta(days=1)
    while current_date < start_date:
        day_of_year = current_date.timetuple().tm_yday
        month = current_date.month
        day_of_year_sin = np.sin(2 * np.pi * day_of_year / 365.25)
        day_of_year_cos = np.cos(2 * np.pi * day_of_year / 365.25)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        trend = min((current_date.year - city_data['YEAR'].min()) / (city_data['YEAR'].max() - city_data['YEAR'].min()), 1.0)
        
        last_sequence[:, features.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        last_sequence[:, features.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        last_sequence[:, features.index('MONTH_SIN')] = month_sin
        last_sequence[:, features.index('MONTH_COS')] = month_cos
        last_sequence[:, features.index('TREND')] = trend
        last_sequence[:, features.index('IS_TROPICAL')] = is_tropical
        last_sequence[:, features.index('IS_DESERT')] = is_desert
        last_sequence[:, features.index('IS_TEMPERATE')] = is_temperate
        
        pred = model.predict(last_sequence[np.newaxis, :, :], verbose=0)
        pred_unscaled = scaler_y.inverse_transform(pred)
        pred_unscaled[0, targets.index('PRCP')] = np.expm1(pred_unscaled[0, targets.index('PRCP')])
        pred_unscaled[0, targets.index('SNOW')] = np.expm1(pred_unscaled[0, targets.index('SNOW')])
        
        next_input = np.zeros((1, len(features)))
        for i, col in enumerate(targets):
            next_input[0, features.index(col)] = pred[0, i]
        next_input[0, features.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        next_input[0, features.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        next_input[0, features.index('MONTH_SIN')] = month_sin
        next_input[0, features.index('MONTH_COS')] = month_cos
        next_input[0, features.index('TREND')] = trend
        next_input[0, features.index('IS_TROPICAL')] = is_tropical
        next_input[0, features.index('IS_DESERT')] = is_desert
        next_input[0, features.index('IS_TEMPERATE')] = is_temperate
        for col in numeric_cols:
            next_input[0, features.index(f'{col}_LAG1')] = last_sequence[-1, features.index(col)]
            next_input[0, features.index(f'{col}_LAG2')] = last_sequence[-2, features.index(col)]
            next_input[0, features.index(f'{col}_LAG3')] = last_sequence[-3, features.index(col)]
            last_7_days = historical_data[f'{col}'].iloc[-7:].values
            next_input[0, features.index(f'{col}_ROLLING_MEAN_7D')] = np.mean(last_7_days) if len(last_7_days) == 7 else historical_data[f'{col}_ROLLING_MEAN_7D'].iloc[-1]
            next_input[0, features.index(f'{col}_ROLLING_STD_7D')] = np.std(last_7_days) if len(last_7_days) == 7 else historical_data[f'{col}_ROLLING_STD_7D'].iloc[-1]
        
        next_input_df = pd.DataFrame(next_input, columns=features)
        transformed_input = scaler_X.transform(next_input_df)
        last_sequence = np.vstack((last_sequence[1:], transformed_input[0]))
        historical_data = pd.concat([historical_data, next_input_df.iloc[0:1]], ignore_index=True)
        current_date += timedelta(days=1)
    
    logger.info(f"Generating predictions for {city_name} from {start_date} to {end_date}...")
    forecast_sequence = last_sequence.copy()
    for day in range(forecast_days):
        pred_date = start_date + timedelta(days=day)
        day_of_year = pred_date.timetuple().tm_yday
        month = pred_date.month
        day_of_year_sin = np.sin(2 * np.pi * day_of_year / 365.25)
        day_of_year_cos = np.cos(2 * np.pi * day_of_year / 365.25)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        trend = min((pred_date.year - city_data['YEAR'].min()) / (city_data['YEAR'].max() - city_data['YEAR'].min()), 1.0)
        
        forecast_sequence[:, features.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        forecast_sequence[:, features.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        forecast_sequence[:, features.index('MONTH_SIN')] = month_sin
        forecast_sequence[:, features.index('MONTH_COS')] = month_cos
        forecast_sequence[:, features.index('TREND')] = trend
        forecast_sequence[:, features.index('IS_TROPICAL')] = is_tropical
        forecast_sequence[:, features.index('IS_DESERT')] = is_tropical
        forecast_sequence[:, features.index('IS_TEMPERATE')] = is_temperate
        
        pred = model.predict(forecast_sequence[np.newaxis, :, :], verbose=0)
        pred_unscaled = scaler_y.inverse_transform(pred)
        pred_unscaled[0, targets.index('PRCP')] = np.expm1(pred_unscaled[0, targets.index('PRCP')])
        pred_unscaled[0, targets.index('SNOW')] = np.expm1(pred_unscaled[0, targets.index('SNOW')])
        
        pred_values = pred_unscaled[0]
        predictions.append({
            'Date': pred_date,
            'TAVG': round(pred_values[targets.index('TAVG')], 1),
            'PRCP': max(0, round(pred_values[targets.index('PRCP')], 2)),
            'SNOW': max(0, round(pred_values[targets.index('SNOW')], 2)),
            'AWND': max(0, round(pred_values[targets.index('AWND')], 1)),
            'RHUM': max(20, min(100, round(pred_values[targets.index('RHUM')], 1)))
        })
        
        next_input = np.zeros((1, len(features)))
        for i, col in enumerate(targets):
            next_input[0, features.index(col)] = pred[0, i]
        next_input[0, features.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        next_input[0, features.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        next_input[0, features.index('MONTH_SIN')] = month_sin
        next_input[0, features.index('MONTH_COS')] = month_cos
        next_input[0, features.index('TREND')] = trend
        next_input[0, features.index('IS_TROPICAL')] = is_tropical
        next_input[0, features.index('IS_DESERT')] = is_desert
        next_input[0, features.index('IS_TEMPERATE')] = is_temperate
        for col in numeric_cols:
            next_input[0, features.index(f'{col}_LAG1')] = forecast_sequence[-1, features.index(col)]
            next_input[0, features.index(f'{col}_LAG2')] = forecast_sequence[-2, features.index(col)]
            next_input[0, features.index(f'{col}_LAG3')] = forecast_sequence[-3, features.index(col)]
            last_7_days = historical_data[f'{col}'].iloc[-7:].values
            next_input[0, features.index(f'{col}_ROLLING_MEAN_7D')] = np.mean(last_7_days) if len(last_7_days) == 7 else historical_data[f'{col}_ROLLING_MEAN_7D'].iloc[-1]
            next_input[0, features.index(f'{col}_ROLLING_STD_7D')] = np.std(last_7_days) if len(last_7_days) == 7 else historical_data[f'{col}_ROLLING_STD_7D'].iloc[-1]
        
        next_input_df = pd.DataFrame(next_input, columns=features)
        transformed_input = scaler_X.transform(next_input_df)
        forecast_sequence = np.vstack((forecast_sequence[1:], transformed_input[0]))
        historical_data = pd.concat([historical_data, next_input_df.iloc[0:1]], ignore_index=True)
    
    logger.info(f"Predictions completed for {city_name}")
    predictions_df = pd.DataFrame(predictions)
    predictions_df['WTCODE'] = predictions_df.apply(
        lambda row: 4 if row['AWND'] > 20 else 3 if row['SNOW'] > 0 else 2 if row['PRCP'] > 0.5 else 1 if row['RHUM'] > 90 or abs(row['TAVG'] - 32) * 5 / 9 > 32 else 0, axis=1
    )
    return predictions_df

def adjust_itinerary(city_name, predictions, places, start_date, end_date):
    adjusted_itinerary = []
    forecast_days = (pd.to_datetime(end_date).date() - pd.to_datetime(start_date).date()).days + 1
    num_places = len(places)
    
    if num_places <= forecast_days:
        places_per_day = 1
        total_place_assignments = forecast_days
    else:
        places_per_day = -(-num_places // forecast_days)
        total_place_assignments = forecast_days * places_per_day
    
    # Load city data for temperature thresholds
    data = pd.read_csv('all_stations.csv')
    data['DATE'] = pd.to_datetime(data['DATE'])
    city_data = data[data['station_id'] == city_to_station[city_name]].copy()
    
    place_idx = 0
    for day in range(forecast_days):
        if day >= len(predictions):
            logger.warning(f"No weather prediction for day {day + 1} in {city_name}. Skipping adjustment.")
            adjusted_itinerary.append({
                "Day": day + 1,
                "Original Activity": "No activity",
                "Adjusted Activity": "No activity",
                "Reason": "No weather data available",
                "Weather": "N/A"
            })
            continue
        
        weather = predictions.iloc[day]
        pred_date = pd.to_datetime(weather['Date']).date()
        month = pred_date.month
        
        # Get city-specific temperature thresholds for the month
        lower_temp, upper_temp = get_temperature_thresholds(city_data, month)
        
        for place_slot in range(places_per_day):
            if place_idx >= num_places:
                break
            
            day_plan = places[place_idx % num_places]
            activity = day_plan["activity"].lower()
            
            place_category = None
            is_outdoor = False
            for category, info in CATEGORY_MAPPING.items():
                if any(keyword in activity for keyword in info['keywords']):
                    place_category = category
                    if info['type'] == 'outdoor':
                        is_outdoor = True
                    elif info['type'] == 'mixed':
                        indoor_keywords = ['museum', 'gallery', 'indoor', 'exhibit', 'heritage', 'cultural']
                        is_outdoor = not any(keyword in activity for keyword in indoor_keywords)
                    break
            
            if not place_category:
                logger.warning(f"No category found for activity '{activity}'. Assuming outdoor.")
                place_category = 'unknown'
                is_outdoor = True
            
            tavg_c = round((weather['TAVG'] - 32) * 5 / 9, 1)
            
            adjust = False
            reason = ""
            
            # Use city-specific temperature thresholds
            if tavg_c < lower_temp or tavg_c > upper_temp:
                adjust = is_outdoor
                reason = f"extreme temperature (outside {lower_temp:.1f}°C to {upper_temp:.1f}°C)"
            if weather['PRCP'] > 0.5:
                adjust = is_outdoor
                reason = "heavy rain"
            if weather['RHUM'] > 80 and is_outdoor:
                adjust = True
                reason = "high humidity"
            if weather['AWND'] > 20 and 'tour' in activity:
                adjust = True
                reason = "high wind speed"
            
            if adjust:
                new_category = np.random.choice(INDOOR_CATEGORIES)
                new_place = CATEGORY_MAPPING[new_category]
                adjusted_itinerary.append({
                    "Day": day + 1,
                    "Original Activity": day_plan["activity"],
                    "Adjusted Activity": new_place["default_activity"],
                    "Reason": reason,
                    "Weather": f"TAVG: {tavg_c}°C, PRCP: {weather['PRCP']}in, SNOW: {weather['SNOW']}in, AWND: {weather['AWND']}mph, RHUM: {weather['RHUM']}%"
                })
            else:
                adjusted_itinerary.append({
                    "Day": day + 1,
                    "Original Activity": day_plan["activity"],
                    "Adjusted Activity": day_plan["activity"],
                    "Reason": "Weather suitable",
                    "Weather": f"TAVG: {tavg_c}°C, PRCP: {weather['PRCP']}in, SNOW: {weather['SNOW']}in, AWND: {weather['AWND']}mph, RHUM: {weather['RHUM']}%"
                })
            
            place_idx += 1
            if place_idx >= num_places:
                break
    
    return adjusted_itinerary

def main():
    logger.info("This script is intended to be used as a module by weather_controller.py.")
    logger.info("To test weather predictions, use the Flask API endpoint /api/weather/adjust-itinerary.")

if __name__ == "__main__":
    main()