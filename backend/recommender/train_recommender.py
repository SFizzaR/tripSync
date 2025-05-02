import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
import pickle
import os
import ast

ratings = pd.read_csv('recommender/data/ratings.csv')
places = pd.read_csv('recommender/data/places.csv')

# Preprocess fsq_id (unchanged)
def parse_fsq_id(fsq_id):
    try:
        if isinstance(fsq_id, str):
            parsed = ast.literal_eval(fsq_id)
            if isinstance(parsed, list) and len(parsed) == 1:
                return parsed[0]
        return fsq_id
    except (ValueError, SyntaxError):
        return fsq_id

places['fsq_id'] = places['fsq_id'].apply(parse_fsq_id)

# Filter ratings (unchanged)
valid_place_ids = set(places['fsq_id'])
original_ratings_count = len(ratings)
ratings = ratings[ratings['place_id'].isin(valid_place_ids)]
filtered_ratings_count = len(ratings)
if filtered_ratings_count < original_ratings_count:
    print(f"Filtered out {original_ratings_count - filtered_ratings_count} ratings with place_ids not in places collection.")

# Collaborative Filtering with SVD (unchanged)
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings[['user_id', 'place_id', 'rating']], reader)
trainset, testset = train_test_split(data, test_size=0.2)
svd = SVD()
svd.fit(trainset)

# Content-Based Filtering with TF-IDF
def parse_categories(categories):
    try:
        if isinstance(categories, str):
            parsed = ast.literal_eval(categories)
            if isinstance(parsed, list):
                # Normalize category names (e.g., lowercase, remove special chars)
                return ' '.join(str(item).lower().replace(',', '').replace('/', ' ') for item in parsed if isinstance(item, str))
        elif isinstance(categories, list):
            return ' '.join(str(item).lower().replace(',', '').replace('/', ' ') for item in categories if isinstance(item, str))
        return 'unknown'
    except (ValueError, SyntaxError) as e:
        print(f"Error parsing categories: {categories}, error: {e}")
        return 'unknown'

places['categories'] = places['categories'].apply(parse_categories)
places['categories'] = places['categories'].replace('', 'unknown')

# Vectorize categories with TF-IDF
tfidf = TfidfVectorizer(max_features=100, stop_words='english')  # Limit features and remove common words
tfidf_matrix = tfidf.fit_transform(places['categories'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Save the models
with open('recommender/models/recommender_model.pkl', 'wb') as f:
    pickle.dump({'svd': svd, 'cosine_sim': cosine_sim, 'places': places}, f)

print("Recommender model trained and saved successfully.")