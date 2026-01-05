import os

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')

SQLALCHEMY_DATABASE_URI = 'sqlite:///city_data.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

CITY_ZONES = [
    {'id': 'zone_a', 'name': 'Hinjewadi IT Park', 'lat': 18.5912, 'lng': 73.7380, 'color': '#3B82F6'},
    {'id': 'zone_b', 'name': 'PCMC Industrial', 'lat': 18.6280, 'lng': 73.8070, 'color': '#EF4444'},
    {'id': 'zone_c', 'name': 'Wakad Residential', 'lat': 18.5990, 'lng': 73.7630, 'color': '#10B981'},
    {'id': 'zone_d', 'name': 'Aundh Commercial', 'lat': 18.5590, 'lng': 73.8080, 'color': '#F59E0B'},
    {'id': 'zone_e', 'name': 'Nigdi Hub', 'lat': 18.6520, 'lng': 73.7710, 'color': '#8B5CF6'},
    {'id': 'zone_f', 'name': 'Akurdi Industrial', 'lat': 18.6470, 'lng': 73.7930, 'color': '#06B6D4'},
]

SENSOR_THRESHOLDS = {
    'traffic_density': 80,
    'air_quality': 100,
    'noise_level': 75,
    'electricity': 90,
    'water_usage': 85,
}
