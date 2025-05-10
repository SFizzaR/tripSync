import pandas as pd
import json
import numpy as np
from datetime import datetime, timedelta
from meteostat import Stations, Daily
import requests
import time
import os
import tempfile
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# NOAA API token
NOAA_TOKEN = 'uXazHUphwnLZFWORfpktcBuJqPOGqTBD'

# Load city data
with open('cities_with_coords.json', 'r') as f:
    cities = json.load(f)

# Fetch data for all cities
start_date = "2016-01-01"
end_date = "2024-12-31"
all_data = []

# Set up requests session with retries
session = requests.Session()
retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

# Function to fetch data from Meteostat
def fetch_meteostat_data(city, start_date, end_date):
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    stations = Stations()
    stations = stations.nearby(city['lat'], city['lon'])
    station = stations.fetch(1)
    
    if station.empty:
        print(f"No station found for {city['city']} in Meteostat.")
        return None
    
    station_id = station.index[0]
    data = Daily(station_id, start, end)
    data = data.fetch()
    
    if data.empty:
        print(f"No data available for {city['city']} from Meteostat.")
        return None
    
    df = pd.DataFrame({
        'station_id': city['station_id'],
        'DATE': data.index,
        'TAVG': (data['tavg'] * 9/5 + 32),
        'PRCP': (data['prcp'] / 25.4),
        'SNOW': (data['snow'] / 25.4),
        'AWND': (data['wspd'] * 0.621371),
        'RHUM': data['rhum'] if 'rhum' in data.columns else np.nan,
        'WTCODE': data['wmo'] if 'wmo' in data.columns else 0
    })
    
    if 'RHUM' not in df.columns or df['RHUM'].isna().all():
        lat = city['lat']
        if abs(lat) < 15:
            df['RHUM'] = np.random.uniform(70, 90, len(df))
        elif 20 <= abs(lat) <= 30:
            df['RHUM'] = np.random.uniform(20, 30, len(df))
        else:
            df['RHUM'] = np.random.uniform(60, 80, len(df))
    
    return df

# Function to fetch data from NOAA
def fetch_noaa_data(city, start_date, end_date):
    if NOAA_TOKEN is None:
        print("NOAA API token not provided. Skipping NOAA fetch for", city['city'])
        return None
    
    print(f"Fetching NOAA data for {city['city']}...")
    # Search for stations within a wider bounding box
    lat, lon = city['lat'], city['lon']
    lat_min, lat_max = lat - 3, lat + 3  # Wider box to increase chances
    lon_min, lon_max = lon - 3, lon + 3
    
    url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/stations"
    params = {
        "datasetid": "GHCND",
        "limit": 100,  # Increase limit to find more stations
        "extent": f"{lat_min},{lon_min},{lat_max},{lon_max}"
    }
    headers = {"token": NOAA_TOKEN}
    
    try:
        response = session.get(url, params=params, headers=headers)
        response.raise_for_status()
        stations = response.json()
        if not stations.get('results'):
            print(f"No NOAA station found for {city['city']}.")
            return None
        # Select the first station with recent data
        station_id = None
        for station in stations['results']:
            if 'maxdate' in station and station['maxdate'] >= start_date:
                station_id = station['id']
                break
        if not station_id:
            print(f"No NOAA station with recent data found for {city['city']}.")
            return None
        print(f"Found NOAA station {station_id} for {city['city']}")
    except requests.exceptions.RequestException as e:
        print(f"Error finding NOAA station for {city['city']}: {e}")
        print(f"Response: {response.text if 'response' in locals() else 'No response'}")
        return None
    
    # Check available data types for the station
    url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes"
    params = {
        "stationid": station_id,
        "datasetid": "GHCND",
        "limit": 1000
    }
    try:
        response = session.get(url, params=params, headers=headers)
        response.raise_for_status()
        datatypes = response.json()
        available_datatypes = [dt['id'] for dt in datatypes.get('results', [])]
        # Prioritize desired data types
        desired_datatypes = ['TAVG', 'TMAX', 'TMIN', 'PRCP', 'SNOW', 'AWND']
        datatypes_to_request = [dt for dt in desired_datatypes if dt in available_datatypes]
        if not datatypes_to_request:
            print(f"No relevant data types available for {city['city']} at station {station_id}.")
            return None
        datatype_str = ','.join(datatypes_to_request)
        print(f"Requesting data types: {datatype_str}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data types for {city['city']}: {e}")
        return None
    
    # Fetch daily data
    url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data"
    params = {
        "datasetid": "GHCND",
        "stationid": station_id,
        "startdate": start_date,
        "enddate": end_date,
        "limit": 1000,
        "datatypeid": datatype_str
    }
    
    data_list = []
    offset = 1
    while True:
        params["offset"] = offset
        try:
            response = session.get(url, params=params, headers=headers)
            response.raise_for_status()
            result = response.json()
            if not result.get('results'):
                break
            data_list.extend(result['results'])
            offset += 1000
            time.sleep(0.5)  # Increased delay to avoid rate limits
        except requests.exceptions.RequestException as e:
            print(f"Error fetching NOAA data for {city['city']}: {e}")
            print(f"Response: {response.text if 'response' in locals() else 'No response'}")
            break
    
    if not data_list:
        print(f"No NOAA data available for {city['city']}.")
        return None
    
    # Process NOAA data
    dates = {}
    for entry in data_list:
        date = entry['date'].split('T')[0]
        if date not in dates:
            dates[date] = {}
        dates[date][entry['datatype']] = entry['value']
    
    df_data = []
    for date, values in dates.items():
        # Calculate TAVG from TMAX and TMIN if TAVG is not available
        if 'TAVG' in values:
            tavg = values['TAVG'] / 10 * 9/5 + 32
        elif 'TMAX' in values and 'TMIN' in values:
            tavg = ((values['TMAX'] + values['TMIN']) / 2) / 10 * 9/5 + 32
        else:
            tavg = np.nan
        prcp = (values.get('PRCP', 0) / 10 / 25.4) if 'PRCP' in values else 0
        snow = (values.get('SNOW', 0) / 25.4) if 'SNOW' in values else 0
        awnd = (values.get('AWND', np.nan) / 10 * 2.23694) if 'AWND' in values else np.nan
        
        df_data.append({
            'station_id': city['station_id'],
            'DATE': date,
            'TAVG': tavg,
            'PRCP': prcp,
            'SNOW': snow,
            'AWND': awnd,
            'RHUM': np.nan,
            'WTCODE': 0
        })
    
    df = pd.DataFrame(df_data)
    df['DATE'] = pd.to_datetime(df['DATE'])
    
    lat = city['lat']
    if abs(lat) < 15:
        df['RHUM'] = np.random.uniform(70, 90, len(df))
    elif 20 <= abs(lat) <= 30:
        df['RHUM'] = np.random.uniform(20, 30, len(df))
    else:
        df['RHUM'] = np.random.uniform(60, 80, len(df))
    
    return df

# Function to generate synthetic data
def generate_synthetic_data(city, start_date, end_date):
    print(f"Generating synthetic data for {city['city']}...")
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    dates = [start + timedelta(days=x) for x in range((end - start).days + 1)]
    lat, lon = city['lat'], city['lon']
    
    # Infer climate parameters
    if abs(lat) < 15:  # Tropical
        base_temp = 85
        daily_prcp_base, rain_prob, base_rhum = 0.2, 0.4, 80
    elif 20 <= abs(lat) <= 30:  # Desert
        base_temp = 95
        daily_prcp_base, rain_prob, base_rhum = 0.005, 0.02, 25
    else:  # Temperate
        base_temp = 70
        daily_prcp_base, rain_prob, base_rhum = 0.1, 0.2, 70
    
    temp_amplitude = abs(lat) * 0.5
    if 100 <= lon <= 150 and abs(lat) < 30:
        daily_prcp_base *= 1.5
        rain_prob *= 1.5
    snowy = abs(lat) > 40
    rain_prob = min(rain_prob, 0.5)
    
    data = []
    for date in dates:
        month = date.month - 1
        day_of_year = (date - datetime(date.year, 1, 1)).days
        seasonal_factor = temp_amplitude * np.sin(2 * np.pi * day_of_year / 365 + (np.pi if lat > 0 else 0))
        
        # Adjust temperature for month (warmer in May for desert regions)
        month_temp_adjust = 5 if month in [4, 5, 6] and 20 <= abs(lat) <= 30 else 0
        tavg = base_temp + seasonal_factor + np.random.uniform(-3, 3) + month_temp_adjust
        is_raining = np.random.random() < rain_prob
        prcp = np.random.uniform(daily_prcp_base, daily_prcp_base * 3) if is_raining else 0
        snow = 0
        if snowy and month in [11, 0, 1] and tavg < 32:
            snow = np.random.uniform(0.1, 1.0) if np.random.random() < 0.3 else 0
        awnd = np.random.uniform(5, 15)
        rhum = max(20, min(100, base_rhum + seasonal_factor * 0.5 + np.random.uniform(-5, 5)))
        wtcode = 0 if snow > 0 else 2 if prcp > 0 else 1 if rhum > 90 else 0
        
        data.append({
            'station_id': city['station_id'],
            'DATE': date,
            'TAVG': round(tavg, 1),
            'PRCP': round(prcp, 2),
            'SNOW': round(snow, 2),
            'AWND': round(awnd, 1),
            'RHUM': round(rhum, 1),
            'WTCODE': wtcode
        })
    
    return pd.DataFrame(data)

# Fetch data for all cities
for city in cities:
    print(f"\nProcessing {city['city']}...")
    # Try Meteostat first
    df = fetch_meteostat_data(city, start_date, end_date)
    if df is None:
        # Fallback to NOAA
        df = fetch_noaa_data(city, start_date, end_date)
    if df is None:
        # Fallback to synthetic data
        df = generate_synthetic_data(city, start_date, end_date)
    all_data.append(df)

# Combine and save to CSV with error handling
all_stations = pd.concat(all_data, ignore_index=True)
all_stations['TAVG'] = all_stations['TAVG'].fillna(all_stations['TAVG'].mean())
all_stations['PRCP'] = all_stations['PRCP'].fillna(0)
all_stations['SNOW'] = all_stations['SNOW'].fillna(0)
all_stations['AWND'] = all_stations['AWND'].fillna(all_stations['AWND'].mean())
all_stations['RHUM'] = all_stations['RHUM'].fillna(all_stations['RHUM'].mean())
all_stations['WTCODE'] = all_stations['WTCODE'].fillna(0)

# Save to a temporary file first to avoid permission issues
output_path = 'all_stations.csv'
try:
    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
        temp_path = tmp_file.name
        all_stations.to_csv(temp_path, index=False)
    # Move the temporary file to the final location
    os.replace(temp_path, output_path)
    print(f"Data saved to {output_path}")
except PermissionError as e:
    print(f"PermissionError: Unable to save file to {output_path}. {e}")
    print("Try closing any programs that might be using the file, or save to a different location.")
except Exception as e:
    print(f"Error saving file: {e}")