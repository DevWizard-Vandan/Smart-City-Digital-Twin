import requests
from config import OPENWEATHER_API_KEY

OPENWEATHER_AQI_URL = "http://api.openweathermap.org/data/2.5/air_pollution"
OPENWEATHER_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"

def fetch_real_aqi(lat, lng):
    try:
        response = requests.get(
            OPENWEATHER_AQI_URL,
            params={'lat': lat, 'lon': lng, 'appid': OPENWEATHER_API_KEY},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if 'list' in data and len(data['list']) > 0:
                components = data['list'][0].get('components', {})
                aqi_index = data['list'][0].get('main', {}).get('aqi', 1)
                
                aqi_mapping = {1: 25, 2: 50, 3: 100, 4: 150, 5: 200}
                base_aqi = aqi_mapping.get(aqi_index, 100)
                
                pm25 = components.get('pm2_5', 0)
                pm10 = components.get('pm10', 0)
                
                calculated_aqi = max(base_aqi, pm25 * 2, pm10)
                
                return {
                    'aqi': min(calculated_aqi, 500),
                    'pm2_5': pm25,
                    'pm10': pm10,
                    'no2': components.get('no2', 0),
                    'so2': components.get('so2', 0),
                    'co': components.get('co', 0),
                    'o3': components.get('o3', 0),
                    'source': 'openweathermap'
                }
    except Exception as e:
        print(f"Error fetching AQI: {e}")
    
    return None

def fetch_weather(lat, lng):
    try:
        response = requests.get(
            OPENWEATHER_WEATHER_URL,
            params={'lat': lat, 'lon': lng, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'temperature': data.get('main', {}).get('temp', 0),
                'humidity': data.get('main', {}).get('humidity', 0),
                'pressure': data.get('main', {}).get('pressure', 0),
                'wind_speed': data.get('wind', {}).get('speed', 0),
                'description': data.get('weather', [{}])[0].get('description', ''),
                'icon': data.get('weather', [{}])[0].get('icon', '01d'),
                'source': 'openweathermap'
            }
    except Exception as e:
        print(f"Error fetching weather: {e}")
    
    return None

def fetch_zone_live_data(lat, lng):
    aqi_data = fetch_real_aqi(lat, lng)
    weather_data = fetch_weather(lat, lng)
    
    return {
        'aqi': aqi_data,
        'weather': weather_data
    }
