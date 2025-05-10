import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import RobustScaler
from sklearn.model_selection import TimeSeriesSplit
from tensorflow.keras.models import Sequential, load_model, save_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.losses import MeanSquaredError
from tensorflow.keras.regularizers import l2
from sklearn.metrics import mean_squared_error, mean_absolute_error
import json
import pickle
import os
import itertools
import logging
import time
import traceback
import tempfile
import shutil

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

logger.info("Available Cities and Station IDs:")
for city, station_id in city_to_station.items():
    logger.info(f"City: {city}, Station ID: {station_id}")

# Define get_climate_zone function globally
def get_climate_zone(lat):
    if abs(lat) < 15:
        return 1, 0, 0  # Tropical
    elif 20 <= abs(lat) <= 30:
        return 0, 1, 0  # Desert
    else:
        return 0, 0, 1  # Temperate

def load_and_preprocess_data(file_path):
    df = pd.read_csv(file_path, parse_dates=['DATE'])
    
    numeric_cols = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM']
    df[numeric_cols] = df[numeric_cols].interpolate(method='linear', limit_direction='both')
    
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
    
    df['PRCP'] = np.log1p(df['PRCP'])
    df['SNOW'] = np.log1p(df['SNOW'])
    
    df['DAY_OF_YEAR'] = df['DATE'].dt.dayofyear
    df['DAY_OF_YEAR_SIN'] = np.sin(2 * np.pi * df['DAY_OF_YEAR'] / 365.25)
    df['DAY_OF_YEAR_COS'] = np.cos(2 * np.pi * df['DAY_OF_YEAR'] / 365.25)
    df['MONTH'] = df['DATE'].dt.month
    df['MONTH_SIN'] = np.sin(2 * np.pi * df['MONTH'] / 12)
    df['MONTH_COS'] = np.cos(2 * np.pi * df['MONTH'] / 12)
    df['YEAR'] = df['DATE'].dt.year
    df['TREND'] = (df['YEAR'] - df['YEAR'].min()) / (df['YEAR'].max() - df['YEAR'].min())
    
    df['IS_TROPICAL'] = 0
    df['IS_DESERT'] = 0
    df['IS_TEMPERATE'] = 0
    for idx, row in df.iterrows():
        station_id = row['station_id']
        city = station_to_city[station_id]
        lat = next(item['lat'] for item in cities if item['city'] == city)
        is_tropical, is_desert, is_temperate = get_climate_zone(lat)
        df.at[idx, 'IS_TROPICAL'] = is_tropical
        df.at[idx, 'IS_DESERT'] = is_desert
        df.at[idx, 'IS_TEMPERATE'] = is_temperate
    
    for col in numeric_cols:
        for lag in range(1, 4):
            df[f'{col}_LAG{lag}'] = df.groupby('station_id')[col].shift(lag)
        df[f'{col}_ROLLING_MEAN_7D'] = df.groupby('station_id')[col].shift(1).rolling(window=7).mean()
        df[f'{col}_ROLLING_STD_7D'] = df.groupby('station_id')[col].shift(1).rolling(window=7).std()
    
    df = df.dropna()
    return df

def create_sequences(data, seq_length, features, targets):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[features].iloc[i:i + seq_length].values)
        y.append(data[targets].iloc[i + seq_length].values)
    return np.array(X), np.array(y)

def build_and_train_model(X_train, y_train, X_val, y_val, lstm_units, dropout_rate, learning_rate, batch_size):
    model = Sequential([
        Input(shape=(X_train.shape[1], X_train.shape[2])),
        LSTM(lstm_units, return_sequences=True, kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(dropout_rate),
        LSTM(lstm_units // 2, kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(dropout_rate),
        Dense(16, activation='relu'),
        Dense(y_train.shape[1])
    ])
    model.compile(optimizer=Adam(learning_rate=learning_rate), loss=mse)
    
    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=10,
        batch_size=128,
        callbacks=[early_stopping, reduce_lr],
        verbose=0
    )
    return model, min(history.history['val_loss'])

def evaluate_model(model, X_test, y_test, scaler_y, target_cols):
    y_pred = model.predict(X_test, verbose=0)
    y_test_inv = scaler_y.inverse_transform(y_test)
    y_pred_inv = scaler_y.inverse_transform(y_pred)
    
    y_test_inv[:, target_cols.index('PRCP')] = np.expm1(y_test_inv[:, target_cols.index('PRCP')])
    y_test_inv[:, target_cols.index('SNOW')] = np.expm1(y_test_inv[:, target_cols.index('SNOW')])
    y_pred_inv[:, target_cols.index('PRCP')] = np.expm1(y_pred_inv[:, target_cols.index('PRCP')])
    y_pred_inv[:, target_cols.index('SNOW')] = np.expm1(y_pred_inv[:, target_cols.index('SNOW')])
    
    metrics = {}
    for i, col in enumerate(target_cols):
        rmse = np.sqrt(mean_squared_error(y_test_inv[:, i], y_pred_inv[:, i]))
        mae = mean_absolute_error(y_test_inv[:, i], y_pred_inv[:, i])
        metrics[col] = {'RMSE': rmse, 'MAE': mae}
    return metrics

def cross_validate_model(X, y, seq_length, features, lstm_units, dropout_rate, learning_rate, batch_size, n_splits=3):
    tscv = TimeSeriesSplit(n_splits=n_splits)
    val_losses = []
    
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        
        model, val_loss = build_and_train_model(X_train, y_train, X_val, y_val, lstm_units, dropout_rate, learning_rate, batch_size)
        val_losses.append(val_loss)
    
    return np.mean(val_losses)

def predict_future_weather(model, last_sequence, scaler_X, scaler_y, future_dates, seq_length, feature_cols, target_cols, station_id):
    predictions = []
    current_sequence = last_sequence.copy()
    
    for day in range(len(future_dates)):
        pred_date = future_dates[day]
        day_of_year = pred_date.timetuple().tm_yday
        month = pred_date.month
        day_of_year_sin = np.sin(2 * np.pi * day_of_year / 365.25)
        day_of_year_cos = np.cos(2 * np.pi * day_of_year / 365.25)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        trend = min((pred_date.year - 2016) / (2024 - 2016), 1.0)
        
        # Update climate zone features based on station_id
        city = station_to_city[station_id]
        lat = next(item['lat'] for item in cities if item['city'] == city)
        is_tropical, is_desert, is_temperate = get_climate_zone(lat)
        
        current_sequence[:, feature_cols.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        current_sequence[:, feature_cols.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        current_sequence[:, feature_cols.index('MONTH_SIN')] = month_sin
        current_sequence[:, feature_cols.index('MONTH_COS')] = month_cos
        current_sequence[:, feature_cols.index('TREND')] = trend
        current_sequence[:, feature_cols.index('IS_TROPICAL')] = is_tropical
        current_sequence[:, feature_cols.index('IS_DESERT')] = is_desert
        current_sequence[:, feature_cols.index('IS_TEMPERATE')] = is_temperate
        
        pred = model.predict(current_sequence[np.newaxis, :, :], verbose=0)
        pred_unscaled = scaler_y.inverse_transform(pred)
        pred_unscaled[0, target_cols.index('PRCP')] = np.expm1(pred_unscaled[0, target_cols.index('PRCP')])
        pred_unscaled[0, target_cols.index('SNOW')] = np.expm1(pred_unscaled[0, target_cols.index('SNOW')])
        
        pred_values = pred_unscaled[0]
        predictions.append({
            'Date': pred_date,
            'TAVG': round(pred_values[target_cols.index('TAVG')], 1),
            'PRCP': max(0, round(pred_values[target_cols.index('PRCP')], 2)),
            'SNOW': max(0, round(pred_values[target_cols.index('SNOW')], 2)),
            'AWND': max(0, round(pred_values[target_cols.index('AWND')], 1)),
            'RHUM': max(20, min(100, round(pred_values[target_cols.index('RHUM')], 1)))
        })
        
        next_input = np.zeros((1, len(feature_cols)))
        for i, col in enumerate(target_cols):
            next_input[0, feature_cols.index(col)] = pred[0, i]
        next_input[0, feature_cols.index('DAY_OF_YEAR_SIN')] = day_of_year_sin
        next_input[0, feature_cols.index('DAY_OF_YEAR_COS')] = day_of_year_cos
        next_input[0, feature_cols.index('MONTH_SIN')] = month_sin
        next_input[0, feature_cols.index('MONTH_COS')] = month_cos
        next_input[0, feature_cols.index('TREND')] = trend
        next_input[0, feature_cols.index('IS_TROPICAL')] = is_tropical
        next_input[0, feature_cols.index('IS_DESERT')] = is_desert
        next_input[0, feature_cols.index('IS_TEMPERATE')] = is_temperate
        
        for col in ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM']:
            next_input[0, feature_cols.index(f'{col}_LAG1')] = current_sequence[-1, feature_cols.index(col)]
            next_input[0, feature_cols.index(f'{col}_LAG2')] = current_sequence[-2, feature_cols.index(col)]
            next_input[0, feature_cols.index(f'{col}_LAG3')] = current_sequence[-3, feature_cols.index(col)]
            next_input[0, feature_cols.index(f'{col}_ROLLING_MEAN_7D')] = current_sequence[-1, feature_cols.index(f'{col}_ROLLING_MEAN_7D')]
            next_input[0, feature_cols.index(f'{col}_ROLLING_STD_7D')] = current_sequence[-1, feature_cols.index(f'{col}_ROLLING_STD_7D')]
        
        current_sequence = np.vstack((current_sequence[1:], scaler_X.transform([next_input[0]])))
    
    predictions_df = pd.DataFrame(predictions)
    predictions_df['WTCODE'] = predictions_df.apply(
        lambda row: 3 if row['SNOW'] > 0 else 2 if row['PRCP'] > 0 else 1 if row['RHUM'] > 90 else 0, axis=1
    )
    return predictions_df

def train_lstm_model(station_id, city_name, seq_length=30, forecast_days=7, max_train_time=1800):
    model_dir = 'weather_model'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, f'lstm_model_{city_name.lower().replace(" ", "_")}.keras')
    scaler_path = os.path.join(model_dir, f'scaler_{city_name.lower().replace(" ", "_")}.pkl')
    
    model = None
    scaler_y = None
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        logger.info(f"Attempting to load existing model for {city_name}...")
        try:
            model = load_model(model_path, custom_objects={'mse': mse})
            with open(scaler_path, 'rb') as f:
                scaler_y = pickle.load(f)
            logger.info(f"Successfully loaded model for {city_name}")
            # Validate the loaded model with a dummy prediction
            dummy_data = np.zeros((1, seq_length, len(['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM', 'DAY_OF_YEAR_SIN', 'DAY_OF_YEAR_COS',
                                                       'MONTH_SIN', 'MONTH_COS', 'TREND', 'IS_TROPICAL', 'IS_DESERT', 'IS_TEMPERATE',
                                                       'TAVG_LAG1', 'PRCP_LAG1', 'SNOW_LAG1', 'AWND_LAG1', 'RHUM_LAG1',
                                                       'TAVG_LAG2', 'PRCP_LAG2', 'SNOW_LAG2', 'AWND_LAG2', 'RHUM_LAG2',
                                                       'TAVG_LAG3', 'PRCP_LAG3', 'SNOW_LAG3', 'AWND_LAG3', 'RHUM_LAG3',
                                                       'TAVG_ROLLING_MEAN_7D', 'PRCP_ROLLING_MEAN_7D', 'SNOW_ROLLING_MEAN_7D', 'AWND_ROLLING_MEAN_7D', 'RHUM_ROLLING_MEAN_7D',
                                                       'TAVG_ROLLING_STD_7D', 'PRCP_ROLLING_STD_7D', 'SNOW_ROLLING_STD_7D', 'AWND_ROLLING_STD_7D', 'RHUM_ROLLING_STD_7D'])))
            model.predict(dummy_data)
            return pd.DataFrame(), model, None, scaler_y, None
        except Exception as e:
            logger.error(f"Failed to load or validate model for {city_name}: {str(e)}")
            logger.info(f"Deleting corrupted model file and retraining...")
            os.remove(model_path)
            if os.path.exists(scaler_path):
                os.remove(scaler_path)
    
    logger.info(f"Loading and preprocessing data for {city_name}...")
    data = load_and_preprocess_data('all_stations.csv')
    
    logger.info(f"Filtering data for {city_name} (Station ID: {station_id})...")
    city_data = data[data['station_id'] == station_id].copy()
    if city_data.empty:
        logger.warning(f"No data available for {city_name} (Station ID: {station_id})")
        return None, None, None, None, None
    
    city_data = city_data.sort_values('DATE')
    
    features = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM', 'DAY_OF_YEAR_SIN', 'DAY_OF_YEAR_COS',
                'MONTH_SIN', 'MONTH_COS', 'TREND', 'IS_TROPICAL', 'IS_DESERT', 'IS_TEMPERATE',
                'TAVG_LAG1', 'PRCP_LAG1', 'SNOW_LAG1', 'AWND_LAG1', 'RHUM_LAG1',
                'TAVG_LAG2', 'PRCP_LAG2', 'SNOW_LAG2', 'AWND_LAG2', 'RHUM_LAG2',
                'TAVG_LAG3', 'PRCP_LAG3', 'SNOW_LAG3', 'AWND_LAG3', 'RHUM_LAG3',
                'TAVG_ROLLING_MEAN_7D', 'PRCP_ROLLING_MEAN_7D', 'SNOW_ROLLING_MEAN_7D', 'AWND_ROLLING_MEAN_7D', 'RHUM_ROLLING_MEAN_7D',
                'TAVG_ROLLING_STD_7D', 'PRCP_ROLLING_STD_7D', 'SNOW_ROLLING_STD_7D', 'AWND_ROLLING_STD_7D', 'RHUM_ROLLING_STD_7D']
    targets = ['TAVG', 'PRCP', 'SNOW', 'AWND', 'RHUM']
    
    train_df = city_data[city_data['DATE'].dt.year <= 2022]
    test_df = city_data[city_data['DATE'].dt.year >= 2023]
    
    if len(train_df) < 365 or len(test_df) < 30:
        logger.warning(f"Insufficient data for {city_name}: train={len(train_df)}, test={len(test_df)}")
        return None, None, None, None, None
    
    logger.info(f"Normalizing features and targets for {city_name}...")
    scaler_X = RobustScaler()
    scaler_y = RobustScaler()
    scaled_features = scaler_X.fit_transform(city_data[features])
    scaled_targets = scaler_y.fit_transform(city_data[targets])
    scaled_df = pd.DataFrame(scaled_features, columns=features, index=city_data.index)
    
    logger.info(f"Creating sequences for {city_name}...")
    X_train, y_train = create_sequences(
        scaled_df.loc[train_df.index], seq_length, features, targets
    )
    X_test, y_test = create_sequences(
        scaled_df.loc[test_df.index], seq_length, features, targets
    )
    
    if len(X_train) == 0 or len(X_test) == 0:
        logger.warning(f"Insufficient sequences for {city_name}: X_train={len(X_train)}, X_test={len(X_test)}")
        return None, None, None, None, None
    
    param_grid = {
        'lstm_units': [64, 128],
        'dropout_rate': [0.4, 0.5],
        'learning_rate': [0.0005, 0.0001],
        'batch_size': [128, 256]
    }
    
    keys, values = zip(*param_grid.items())
    param_combinations = [dict(zip(keys, v)) for v in itertools.product(*values)]
    
    best_model = None
    best_scaler_y = scaler_y
    best_val_loss = float('inf')
    best_params = None
    metrics = None
    
    start_time = time.time()
    for params in param_combinations:
        logger.info(f"Testing parameters for {city_name}: {params}")
        
        if time.time() - start_time > max_train_time:
            logger.warning(f"Training for {city_name} exceeded {max_train_time} seconds. Stopping...")
            return None, None, None, None, None
        
        try:
            val_loss = cross_validate_model(
                X_train, y_train, seq_length, features,
                params['lstm_units'], params['dropout_rate'],
                params['learning_rate'], params['batch_size']
            )
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_model, _ = build_and_train_model(
                    X_train, y_train, X_test, y_test,
                    params['lstm_units'], params['dropout_rate'],
                    params['learning_rate'], params['batch_size']
                )
                best_params = params
                metrics = evaluate_model(best_model, X_test, y_test, scaler_y, targets)
                
        except Exception as e:
            logger.error(f"Error training with params {params} for {city_name}: {str(e)}")
            logger.error(traceback.format_exc())
            continue
    
    if best_model is None:
        logger.error(f"Failed to train model for {city_name}")
        return None, None, None, None, None
    
    logger.info(f"Best parameters for {city_name}: {best_params}")
    logger.info(f"Metrics for {city_name}: {metrics}")
    
    # Save the model in weather_model directory
    logger.info(f"Saving model for {city_name}...")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.keras') as tmp_model:
            save_model(best_model, tmp_model.name)
        if os.path.exists(model_path):
            logger.info(f"Overwriting existing model at {model_path}")
            os.remove(model_path)
        shutil.move(tmp_model.name, model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Validate the saved model
        loaded_model = load_model(model_path, custom_objects={'mse': mse})
        dummy_data = np.zeros((1, seq_length, len(features)))
        loaded_model.predict(dummy_data)
        logger.info(f"Successfully validated saved model for {city_name}")
    except Exception as e:
        logger.error(f"Failed to save or validate model for {city_name}: {str(e)}")
        return None, None, None, None, None
    
    # Save the scaler in weather_model directory
    logger.info(f"Saving scaler for {city_name}...")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pkl') as tmp_scaler:
            pickle.dump(scaler_y, tmp_scaler)
        if os.path.exists(scaler_path):
            logger.info(f"Overwriting existing scaler at {scaler_path}")
            os.remove(scaler_path)
        shutil.move(tmp_scaler.name, scaler_path)
        logger.info(f"Scaler saved to {scaler_path}")
        
        # Validate the saved scaler
        with open(scaler_path, 'rb') as f:
            loaded_scaler = pickle.load(f)
        logger.info(f"Successfully validated saved scaler for {city_name}")
    except Exception as e:
        logger.error(f"Failed to save or validate scaler for {city_name}: {str(e)}")
        return None, None, None, None, None
    
    logger.info(f"Generating predictions for {city_name}...")
    future_dates = pd.date_range(start='2025-05-02', end=f'2025-05-0{2+forecast_days-1}', freq='D')
    last_sequence = scaled_df[features].iloc[-seq_length:].values
    predictions_df = predict_future_weather(
        best_model, last_sequence, scaler_X, scaler_y, future_dates, seq_length, features, targets, station_id
    )
    
    logger.info(f"Predictions completed for {city_name}")
    return predictions_df, best_model, scaler_X, scaler_y, metrics

def main():
    all_predictions = {}
    all_metrics = {}
    for city_name, station_id in city_to_station.items():
        logger.info(f"\nTraining model for {city_name}...")
        try:
            predictions_df, model, scaler_X, scaler_y, metrics = train_lstm_model(
                station_id, city_name, seq_length=30, forecast_days=7
            )
            if predictions_df is not None and not predictions_df.empty:
                all_predictions[city_name] = predictions_df
                all_metrics[city_name] = metrics
            else:
                logger.warning(f"Skipping predictions for {city_name} due to insufficient data or existing model.")
        except Exception as e:
            logger.error(f"Error processing {city_name}: {str(e)}")
            logger.error(traceback.format_exc())
    
    if all_predictions:
        predictions_list = [df.assign(City=city) for city, df in all_predictions.items()]
        final_predictions = pd.concat(predictions_list)
        final_predictions.to_csv('predictions_may_2025.csv', index=False)
        logger.info("Predictions saved to predictions_may_2025.csv")
    
    if all_metrics:
        metrics_df = pd.DataFrame.from_dict({(city, var, metric): all_metrics[city][var][metric]
                                            for city in all_metrics if all_metrics[city]
                                            for var in all_metrics[city]
                                            for metric in all_metrics[city][var]},
                                           orient='index').unstack()
        metrics_df.to_csv('model_metrics.csv')
        logger.info("Metrics saved to model_metrics.csv")
    
    logger.info("\nWeather Predictions for All Cities:")
    for city_name, predictions in all_predictions.items():
        logger.info(f"\n{city_name}:")
        logger.info(predictions)

if __name__ == "__main__":
    main()
