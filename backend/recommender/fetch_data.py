import pymongo
import pandas as pd
import os
import ast
from dotenv import load_dotenv

load_dotenv()

data_dir = 'recommender/data'
# Connect to MongoDB
client = pymongo.MongoClient(os.getenv('CONNECTION_STRING'))
db = client['test']

# Fetch ratings data
ratings_data = list(db.userratings.find())
ratings = pd.DataFrame(ratings_data)
print(f"Ratings DataFrame columns: {ratings.columns.tolist()}")

# Save ratings to CSV
ratings.to_csv(os.path.join(data_dir, 'ratings.csv'), index=False)

# Fetch places data
places_data = list(db.places.find())

# Create DataFrame with explicit fields
places_list = []
for place in places_data:
    places_list.append({
        'fsq_id': place.get('fsq_id', 'Unknown'),
        'name': place.get('name', 'Unknown'),
        'city': place.get('city', 'Unknown'),
        'categories': place.get('categories', ['Unknown']),
        'address': place.get('address', 'Unknown'),
        'latitude': place.get('latitude', 0),
        'longitude': place.get('longitude', 0),
        'reviews': place.get('reviews', []),
        'photos': place.get('photos', [])
    })

places = pd.DataFrame(places_list)
print(f"Places DataFrame columns: {places.columns.tolist()}")

# Save places to CSV
places.to_csv(os.path.join(data_dir, 'places.csv'), index=False)

# Close MongoDB connection
client.close()