import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const userIcon = new L.DivIcon({
    className: 'custom-user-marker',
    html: `<div style="
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
  "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const ZoneMarker = ({ zone, data }) => {
    const getStatusColor = () => {
        const avgValue = (
            (data?.traffic_density || 0) +
            (data?.noise_level || 0) +
            (data?.electricity || 0) +
            (data?.water_usage || 0)
        ) / 4;

        const aqi = data?.air_quality || 0;

        if (aqi > 100 || avgValue > 80) return '#ef4444';
        if (aqi > 75 || avgValue > 60) return '#f59e0b';
        return '#10b981';
    };

    const getSensorIcon = (type) => {
        const icons = {
            traffic: '🚗',
            air: '🌬️',
            noise: '🔊',
            power: '⚡',
            water: '💧'
        };
        return icons[type] || '📊';
    };

    return (
        <CircleMarker
            center={[zone.lat, zone.lng]}
            radius={35}
            pathOptions={{
                fillColor: zone.color,
                fillOpacity: 0.6,
                color: getStatusColor(),
                weight: 3,
                opacity: 1,
            }}
        >
            <Popup>
                <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg mb-3 text-blue-400">{zone.name}</h3>
                    {data?.data_source === 'live' && (
                        <div className="mb-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs text-center">
                            🔴 Live AQI Data
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>{getSensorIcon('traffic')} Traffic</span>
                            <span className="font-mono">{data?.traffic_density?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{getSensorIcon('air')} AQI</span>
                            <span className="font-mono">{data?.air_quality?.toFixed(1) || 0}</span>
                        </div>
                        {data?.pm2_5 && (
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>PM2.5</span>
                                <span>{data?.pm2_5?.toFixed(1)} µg/m³</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span>{getSensorIcon('noise')} Noise</span>
                            <span className="font-mono">{data?.noise_level?.toFixed(1) || 0} dB</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{getSensorIcon('power')} Power</span>
                            <span className="font-mono">{data?.electricity?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{getSensorIcon('water')} Water</span>
                            <span className="font-mono">{data?.water_usage?.toFixed(1) || 0}%</span>
                        </div>
                        {data?.temperature && (
                            <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                                <span>🌡️ Temp</span>
                                <span className="font-mono">{data?.temperature?.toFixed(1)}°C</span>
                            </div>
                        )}
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
};

const LocationHandler = ({ userLocation, onLocationClick }) => {
    const map = useMap();

    useEffect(() => {
        if (userLocation) {
            map.setView(userLocation, 14);
        }
    }, [userLocation, map]);

    useMapEvents({
        click: (e) => {
            onLocationClick([e.latlng.lat, e.latlng.lng]);
        },
    });

    return null;
};

const CityMap = ({ zones, sensorData, onLocationChange }) => {
    const mapRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [locationMethod, setLocationMethod] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [isLoadingLive, setIsLoadingLive] = useState(false);

    const defaultCenter = [18.6200, 73.7800];

    const getSensorDataForZone = (zoneId) => {
        return sensorData?.find(s => s.zone_id === zoneId) || {};
    };

    const fetchLiveDataForLocation = async (lat, lng) => {
        setIsLoadingLive(true);
        try {
            const response = await fetch(`http://localhost:5000/api/live?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            setLiveData(data);
        } catch (error) {
            console.error('Failed to fetch live data:', error);
        } finally {
            setIsLoadingLive(false);
        }
    };

    const fetchLocationByIP = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.latitude && data.longitude) {
                return {
                    lat: data.latitude,
                    lng: data.longitude,
                    city: data.city,
                    region: data.region
                };
            }
        } catch (error) {
            console.error('IP geolocation failed:', error);
        }
        return null;
    };

    const handleGetLocation = async () => {
        setIsLocating(true);
        setLocationError(null);
        setLocationMethod(null);

        const tryBrowserGeolocation = () => {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve(null);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            method: 'GPS'
                        });
                    },
                    (error) => {
                        console.log('Browser geolocation error:', error.message);
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            });
        };

        let location = await tryBrowserGeolocation();

        if (!location) {
            const ipLocation = await fetchLocationByIP();
            if (ipLocation) {
                location = {
                    lat: ipLocation.lat,
                    lng: ipLocation.lng,
                    method: 'IP',
                    city: ipLocation.city,
                    region: ipLocation.region
                };
            }
        }

        if (location) {
            const newLocation = [location.lat, location.lng];
            setUserLocation(newLocation);
            setLocationMethod(location.method === 'GPS' ? '📍 GPS' : `🌐 IP (${location.city || 'detected'})`);
            fetchLiveDataForLocation(location.lat, location.lng);
            if (onLocationChange) {
                onLocationChange(newLocation);
            }
        } else {
            setLocationError('Could not detect location. Click on map to set manually.');
        }

        setIsLocating(false);
    };

    const handleMapClick = (location) => {
        setUserLocation(location);
        setLocationError(null);
        setLocationMethod('📌 Manual');
        fetchLiveDataForLocation(location[0], location[1]);
        if (onLocationChange) {
            onLocationChange(location);
        }
    };

    const getAqiColor = (aqi) => {
        if (aqi <= 50) return 'text-green-400';
        if (aqi <= 100) return 'text-yellow-400';
        if (aqi <= 150) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="glass-card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">City Map</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLocating ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Detecting...</span>
                            </>
                        ) : (
                            <>
                                <span>📍</span>
                                <span>My Location</span>
                            </>
                        )}
                    </button>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-400">Normal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-slate-400">Warning</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-slate-400">Critical</span>
                        </div>
                    </div>
                </div>
            </div>

            {locationError && (
                <div className="mb-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                    ⚠️ {locationError}
                </div>
            )}

            {userLocation && liveData && liveData.aqi && (
                <div className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-blue-300">
                            {locationMethod} {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className={getAqiColor(liveData.aqi.aqi)}>
                                🌬️ AQI: <strong>{liveData.aqi.aqi?.toFixed(0)}</strong>
                            </span>
                            <span className="text-slate-300">
                                PM2.5: {liveData.aqi.pm2_5?.toFixed(1)}
                            </span>
                            {liveData.weather && (
                                <>
                                    <span className="text-cyan-300">
                                        🌡️ {liveData.weather.temperature?.toFixed(1)}°C
                                    </span>
                                    <span className="text-slate-400 capitalize">
                                        {liveData.weather.description}
                                    </span>
                                </>
                            )}
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                                LIVE
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {userLocation && isLoadingLive && (
                <div className="mb-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Fetching live weather data...</span>
                </div>
            )}

            {userLocation && !liveData && !isLoadingLive && (
                <div className="mb-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                    {locationMethod} {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)} — Click anywhere on map to change
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ height: 'calc(100% - 100px)' }}>
                <MapContainer
                    ref={mapRef}
                    center={userLocation || defaultCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <LocationHandler
                        userLocation={userLocation}
                        onLocationClick={handleMapClick}
                    />

                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>
                                <div className="text-center min-w-[180px]">
                                    <span className="font-bold text-blue-400">📍 Your Location</span>
                                    <br />
                                    <span className="text-xs text-slate-400">
                                        {locationMethod} • {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                                    </span>
                                    {liveData && liveData.aqi && (
                                        <div className="mt-2 pt-2 border-t border-slate-600">
                                            <div className="text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>🌬️ AQI</span>
                                                    <span className="font-bold">{liveData.aqi.aqi?.toFixed(0)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>PM2.5</span>
                                                    <span>{liveData.aqi.pm2_5?.toFixed(1)} µg/m³</span>
                                                </div>
                                                {liveData.weather && (
                                                    <div className="flex justify-between">
                                                        <span>🌡️ Temp</span>
                                                        <span>{liveData.weather.temperature?.toFixed(1)}°C</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-xs text-green-400">🔴 Live Data</div>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {zones.map((zone) => (
                        <ZoneMarker
                            key={zone.id}
                            zone={zone}
                            data={getSensorDataForZone(zone.id)}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default CityMap;
