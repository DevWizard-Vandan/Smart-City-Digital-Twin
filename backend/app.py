from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import google.generativeai as genai
import json
import os

from config import GEMINI_API_KEY, SQLALCHEMY_DATABASE_URI, CITY_ZONES
from models import db, SensorReading, Alert, init_db
from simulation import start_simulation, get_current_readings, get_city_snapshot
from report_generator import generate_sustainability_report

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

init_db(app)

if GEMINI_API_KEY and GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY_HERE':
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    gemini_model = None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/zones', methods=['GET'])
def get_zones():
    return jsonify(CITY_ZONES)

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    readings = get_current_readings()
    return jsonify({
        'timestamp': datetime.utcnow().isoformat(),
        'readings': readings
    })

@app.route('/api/sensors/history', methods=['GET'])
def get_sensor_history():
    zone_id = request.args.get('zone_id')
    hours = int(request.args.get('hours', 1))
    
    since = datetime.utcnow() - timedelta(hours=hours)
    
    query = SensorReading.query.filter(SensorReading.timestamp >= since)
    if zone_id:
        query = query.filter(SensorReading.zone_id == zone_id)
    
    readings = query.order_by(SensorReading.timestamp.desc()).limit(100).all()
    
    return jsonify({
        'readings': [r.to_dict() for r in readings]
    })

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    include_resolved = request.args.get('include_resolved', 'false').lower() == 'true'
    
    query = Alert.query
    if not include_resolved:
        query = query.filter(Alert.resolved == False)
    
    alerts = query.order_by(Alert.timestamp.desc()).limit(50).all()
    
    return jsonify({
        'alerts': [a.to_dict() for a in alerts]
    })

@app.route('/api/ai/analyze', methods=['POST'])
def analyze_city():
    if not gemini_model:
        return jsonify({
            'error': 'Gemini API not configured. Please add your API key to config.py',
            'analysis': 'AI analysis unavailable. Configure GEMINI_API_KEY to enable this feature.'
        }), 200
    
    try:
        data = request.get_json() or {}
        question = data.get('question', 'Provide a general analysis of the city status.')
        
        snapshot = get_city_snapshot()
        
        prompt = f"""You are an AI assistant analyzing a smart city digital twin. 
        
Current City Data:
{json.dumps(snapshot, indent=2)}

User Question: {question}

Provide a concise, actionable analysis focusing on:
1. Current status assessment
2. Identified problems or concerns
3. Specific optimization recommendations

Keep your response under 300 words and format it clearly."""

        response = gemini_model.generate_content(prompt)
        
        return jsonify({
            'analysis': response.text,
            'snapshot': snapshot,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'analysis': f'Error performing analysis: {str(e)}'
        }), 500

@app.route('/api/report/generate', methods=['POST'])
def generate_report():
    try:
        snapshot = get_city_snapshot()
        
        alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(20).all()
        alerts_list = [a.to_dict() for a in alerts]
        
        ai_analysis = None
        if gemini_model:
            try:
                prompt = f"""Generate a brief sustainability analysis for this smart city data:
{json.dumps(snapshot, indent=2)}

Provide 3-5 specific recommendations for improving sustainability. Keep it under 200 words."""
                
                response = gemini_model.generate_content(prompt)
                ai_analysis = response.text
            except Exception:
                pass
        
        report_path = generate_sustainability_report(snapshot, alerts_list, ai_analysis)
        
        return send_file(
            report_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=os.path.basename(report_path)
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snapshot', methods=['GET'])
def get_snapshot():
    return jsonify(get_city_snapshot())

@app.route('/api/live', methods=['GET'])
def get_live_data():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    
    if lat is None or lng is None:
        return jsonify({'error': 'lat and lng parameters required'}), 400
    
    try:
        from live_data import fetch_zone_live_data
        data = fetch_zone_live_data(lat, lng)
        return jsonify({
            'lat': lat,
            'lng': lng,
            'timestamp': datetime.utcnow().isoformat(),
            'aqi': data.get('aqi'),
            'weather': data.get('weather'),
            'source': 'openweathermap'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    start_simulation(app)
    print('Smart City Digital Twin Backend')
    print('================================')
    print('Server running at http://localhost:5000')
    print('Sensor simulation active (updates every 3 seconds)')
    print('🌍 LIVE AQI data from OpenWeatherMap enabled!')
    print('')
    print('Endpoints:')
    print('  GET  /api/sensors         - Current sensor readings')
    print('  GET  /api/sensors/history - Historical data')
    print('  GET  /api/alerts          - Active alerts')
    print('  GET  /api/live?lat=&lng=  - Live AQI for location')
    print('  POST /api/ai/analyze      - Gemini AI analysis')
    print('  POST /api/report/generate - Generate PDF report')
    print('')
    
    app.run(debug=True, port=5000, threaded=True)
