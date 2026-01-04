import random
import threading
import time
from datetime import datetime
from models import db, SensorReading, Alert
from config import CITY_ZONES, SENSOR_THRESHOLDS

current_readings = {}
live_aqi_cache = {}
last_aqi_fetch = {}

def generate_sensor_value(base, variance, min_val=0, max_val=100):
    value = base + random.uniform(-variance, variance)
    return max(min_val, min(max_val, value))

def fetch_live_aqi_for_zone(zone):
    global live_aqi_cache, last_aqi_fetch
    zone_id = zone['id']
    current_time = time.time()
    
    if zone_id in last_aqi_fetch and current_time - last_aqi_fetch[zone_id] < 300:
        return live_aqi_cache.get(zone_id)
    
    try:
        from live_data import fetch_real_aqi, fetch_weather
        aqi_data = fetch_real_aqi(zone['lat'], zone['lng'])
        weather_data = fetch_weather(zone['lat'], zone['lng'])
        
        if aqi_data:
            live_aqi_cache[zone_id] = {
                'aqi': aqi_data,
                'weather': weather_data
            }
            last_aqi_fetch[zone_id] = current_time
            print(f"[LIVE] Fetched real AQI for {zone['name']}: {aqi_data['aqi']:.1f}")
            return live_aqi_cache[zone_id]
    except Exception as e:
        print(f"Error fetching live data for {zone['name']}: {e}")
    
    return None

def generate_zone_data(zone_id, previous=None, zone_info=None):
    live_data = None
    if zone_info:
        live_data = fetch_live_aqi_for_zone(zone_info)
    
    if previous:
        base_data = {
            'zone_id': zone_id,
            'traffic_density': generate_sensor_value(previous['traffic_density'], 10),
            'air_quality': generate_sensor_value(previous['air_quality'], 15, 0, 300),
            'noise_level': generate_sensor_value(previous['noise_level'], 8),
            'electricity': generate_sensor_value(previous['electricity'], 12),
            'water_usage': generate_sensor_value(previous['water_usage'], 10),
        }
    else:
        zone_profiles = {
            'zone_a': {'traffic': 75, 'aqi': 85, 'noise': 55, 'elec': 80, 'water': 50},
            'zone_b': {'traffic': 55, 'aqi': 130, 'noise': 75, 'elec': 90, 'water': 75},
            'zone_c': {'traffic': 45, 'aqi': 55, 'noise': 40, 'elec': 60, 'water': 70},
            'zone_d': {'traffic': 70, 'aqi': 70, 'noise': 65, 'elec': 75, 'water': 55},
            'zone_e': {'traffic': 50, 'aqi': 60, 'noise': 50, 'elec': 65, 'water': 60},
            'zone_f': {'traffic': 45, 'aqi': 110, 'noise': 70, 'elec': 85, 'water': 80},
        }
        
        profile = zone_profiles.get(zone_id, zone_profiles['zone_a'])
        base_data = {
            'zone_id': zone_id,
            'traffic_density': generate_sensor_value(profile['traffic'], 15),
            'air_quality': generate_sensor_value(profile['aqi'], 20, 0, 300),
            'noise_level': generate_sensor_value(profile['noise'], 10),
            'electricity': generate_sensor_value(profile['elec'], 15),
            'water_usage': generate_sensor_value(profile['water'], 12),
        }
    
    if live_data and live_data.get('aqi'):
        base_data['air_quality'] = live_data['aqi']['aqi']
        base_data['pm2_5'] = live_data['aqi'].get('pm2_5', 0)
        base_data['pm10'] = live_data['aqi'].get('pm10', 0)
        base_data['data_source'] = 'live'
    else:
        base_data['data_source'] = 'simulated'
    
    if live_data and live_data.get('weather'):
        base_data['temperature'] = live_data['weather'].get('temperature', 0)
        base_data['humidity'] = live_data['weather'].get('humidity', 0)
        base_data['weather_desc'] = live_data['weather'].get('description', '')
    
    return base_data

def check_thresholds_and_create_alerts(app, zone_data, zone_info):
    with app.app_context():
        zone_id = zone_data['zone_id']
        zone_name = zone_info['name']
        
        alert_configs = [
            ('traffic_density', 'Traffic Congestion', f'High traffic density detected in {zone_name}'),
            ('air_quality', 'Air Quality Warning', f'Poor air quality (AQI) in {zone_name}'),
            ('noise_level', 'Noise Pollution', f'High noise levels detected in {zone_name}'),
            ('electricity', 'Power Consumption', f'High electricity consumption in {zone_name}'),
            ('water_usage', 'Water Usage', f'High water usage detected in {zone_name}'),
        ]
        
        for sensor_type, alert_type, message in alert_configs:
            value = zone_data[sensor_type]
            threshold = SENSOR_THRESHOLDS[sensor_type]
            
            existing = Alert.query.filter_by(
                zone_id=zone_id,
                alert_type=alert_type,
                resolved=False
            ).first()
            
            if value > threshold:
                if not existing:
                    severity = 'critical' if value > threshold * 1.2 else 'warning'
                    alert = Alert(
                        zone_id=zone_id,
                        zone_name=zone_name,
                        alert_type=alert_type,
                        message=f'{message} ({value:.1f}%)',
                        severity=severity
                    )
                    db.session.add(alert)
            elif existing:
                existing.resolved = True
        
        db.session.commit()

def save_reading(app, zone_data):
    with app.app_context():
        reading = SensorReading(
            zone_id=zone_data['zone_id'],
            traffic_density=zone_data['traffic_density'],
            air_quality=zone_data['air_quality'],
            noise_level=zone_data['noise_level'],
            electricity=zone_data['electricity'],
            water_usage=zone_data['water_usage']
        )
        db.session.add(reading)
        db.session.commit()

def simulation_loop(app):
    global current_readings
    
    for zone in CITY_ZONES:
        current_readings[zone['id']] = generate_zone_data(zone['id'], zone_info=zone)
    
    while True:
        for zone in CITY_ZONES:
            zone_id = zone['id']
            current_readings[zone_id] = generate_zone_data(zone_id, current_readings.get(zone_id), zone_info=zone)
            save_reading(app, current_readings[zone_id])
            check_thresholds_and_create_alerts(app, current_readings[zone_id], zone)
        
        time.sleep(3)

def start_simulation(app):
    thread = threading.Thread(target=simulation_loop, args=(app,), daemon=True)
    thread.start()
    return thread

def get_current_readings():
    global current_readings
    result = []
    for zone in CITY_ZONES:
        zone_id = zone['id']
        if zone_id in current_readings:
            data = current_readings[zone_id].copy()
            data['zone_name'] = zone['name']
            data['color'] = zone['color']
            data['lat'] = zone['lat']
            data['lng'] = zone['lng']
            data['timestamp'] = datetime.utcnow().isoformat()
            result.append(data)
    return result

def get_city_snapshot():
    readings = get_current_readings()
    return {
        'timestamp': datetime.utcnow().isoformat(),
        'zones': readings,
        'summary': {
            'avg_traffic': sum(r['traffic_density'] for r in readings) / len(readings) if readings else 0,
            'avg_aqi': sum(r['air_quality'] for r in readings) / len(readings) if readings else 0,
            'avg_noise': sum(r['noise_level'] for r in readings) / len(readings) if readings else 0,
            'total_electricity': sum(r['electricity'] for r in readings),
            'total_water': sum(r['water_usage'] for r in readings),
        }
    }
