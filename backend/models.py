from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class SensorReading(db.Model):
    __tablename__ = 'sensor_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    zone_id = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    traffic_density = db.Column(db.Float)
    air_quality = db.Column(db.Float)
    noise_level = db.Column(db.Float)
    electricity = db.Column(db.Float)
    water_usage = db.Column(db.Float)
    
    def to_dict(self):
        return {
            'id': self.id,
            'zone_id': self.zone_id,
            'timestamp': self.timestamp.isoformat(),
            'traffic_density': self.traffic_density,
            'air_quality': self.air_quality,
            'noise_level': self.noise_level,
            'electricity': self.electricity,
            'water_usage': self.water_usage,
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    zone_id = db.Column(db.String(50), nullable=False)
    zone_name = db.Column(db.String(100), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    severity = db.Column(db.String(20), default='warning')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'zone_id': self.zone_id,
            'zone_name': self.zone_name,
            'alert_type': self.alert_type,
            'message': self.message,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat(),
            'resolved': self.resolved,
        }

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
