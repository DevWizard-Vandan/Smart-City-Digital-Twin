# 🏙️ Smart City Digital Twin

A production-ready web application that simulates a smart city with real-time IoT sensor data, interactive visualizations, AI-powered insights, and PDF sustainability reports.

![Smart City Digital Twin](https://via.placeholder.com/800x400/1e293b/3b82f6?text=Smart+City+Digital+Twin)

## ✨ Features

- **Real-time City Simulation** - Generates fake IoT sensor data for 6 city zones every 3 seconds
- **Interactive Map** - Leaflet-based map with color-coded zone status and popup details
- **Live Charts & Gauges** - Recharts visualizations for traffic, air quality, noise, power, and water
- **Smart Alerts** - Automatic alerts when sensor thresholds are exceeded
- **AI Insights** - Gemini API integration for intelligent city analysis
- **PDF Reports** - One-click sustainability report generation with ReportLab

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python Flask |
| Frontend | React + Tailwind CSS |
| Database | SQLite |
| Charts | Recharts |
| Maps | Leaflet.js |
| AI | Google Gemini API |
| PDF | ReportLab |

## 📁 Project Structure

```
City_Twin/
├── backend/
│   ├── app.py              # Flask main application
│   ├── config.py           # Configuration settings
│   ├── models.py           # SQLite database models
│   ├── simulation.py       # IoT sensor data generator
│   ├── report_generator.py # PDF report generation
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── CityMap.jsx
│   │   │   ├── SensorCharts.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   └── AIInsights.jsx
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone & Setup Backend

```bash
cd City_Twin/backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Gemini API (Optional)

Get a free API key from [Google AI Studio](https://aistudio.google.com/)

Edit `backend/config.py`:
```python
GEMINI_API_KEY = 'your-api-key-here'
```

> **Note:** The app works without an API key - AI features will show a placeholder message.

### 3. Start Backend

```bash
cd backend
python app.py
```

Backend runs at: `http://localhost:5000`

### 4. Setup & Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sensors` | GET | Current sensor readings for all zones |
| `/api/sensors/history` | GET | Historical sensor data |
| `/api/alerts` | GET | Active alerts list |
| `/api/zones` | GET | City zone configurations |
| `/api/ai/analyze` | POST | Send question to Gemini AI |
| `/api/report/generate` | POST | Generate PDF sustainability report |
| `/api/snapshot` | GET | Complete city data snapshot |

## 🎮 Usage Guide

### Dashboard Overview

1. **Map View** - Click on zones to see detailed sensor readings
2. **Gauges** - Real-time metrics with threshold indicators
3. **Charts** - Historical trend visualization
4. **Alerts Panel** - Active warnings and critical issues

### AI Analysis

1. Click a preset question or type your own
2. Gemini analyzes current city data
3. Get actionable insights and recommendations

### Generate Report

1. Click "Download Report" button
2. PDF with full city analysis is generated
3. Includes AI recommendations (if API configured)

## 🏗️ City Zones

| Zone | Profile | Description |
|------|---------|-------------|
| Downtown | High traffic, moderate AQI | Business district |
| Industrial | Low traffic, high AQI | Manufacturing area |
| Residential | Low traffic, low noise | Housing areas |
| Commercial | High traffic, moderate noise | Shopping district |
| Park District | Low traffic, excellent AQI | Green spaces |
| Harbor | Moderate traffic, high water usage | Port area |

## ⚙️ Configuration

### Sensor Thresholds (`config.py`)

```python
SENSOR_THRESHOLDS = {
    'traffic_density': 80,  # %
    'air_quality': 100,     # AQI
    'noise_level': 75,      # dB
    'electricity': 90,      # %
    'water_usage': 85,      # %
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend can't connect to backend | Ensure backend is running on port 5000 |
| CORS errors | Backend includes CORS for localhost:3000 |
| AI analysis fails | Check GEMINI_API_KEY in config.py |
| Map not loading | Check internet for tile server access |

## 📄 License

MIT License - Free for personal and commercial use.

---

**Built with ❤️ for learning and portfolio showcase**
