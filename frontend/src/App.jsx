import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CityMap from './components/CityMap';
import SensorCharts from './components/SensorCharts';
import AlertsPanel from './components/AlertsPanel';
import AIInsights from './components/AIInsights';

const API_BASE = 'http://localhost:5000/api';

function App() {
    const [zones, setZones] = useState([]);
    const [sensorData, setSensorData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const fetchZones = async () => {
        try {
            const response = await fetch(`${API_BASE}/zones`);
            const data = await response.json();
            setZones(data);
        } catch (error) {
            console.error('Failed to fetch zones:', error);
        }
    };

    const fetchSensorData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/sensors`);
            const data = await response.json();
            setSensorData(data.readings || []);

            setHistoryData(prev => {
                const newData = [...prev, ...(data.readings || [])];
                return newData.slice(-100);
            });
        } catch (error) {
            console.error('Failed to fetch sensor data:', error);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/alerts`);
            const data = await response.json();
            setAlerts(data.alerts || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    }, []);

    const handleAnalyze = async (question) => {
        setIsAnalyzing(true);
        setAiAnalysis('');

        try {
            const response = await fetch(`${API_BASE}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();
            setAiAnalysis(data.analysis || 'No analysis available.');
        } catch (error) {
            setAiAnalysis('Failed to get AI analysis. Please check if the backend is running.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);

        try {
            const response = await fetch(`${API_BASE}/report/generate`, {
                method: 'POST',
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sustainability_report_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert('Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please check if the backend is running.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    useEffect(() => {
        fetchZones();
        fetchSensorData();
        fetchAlerts();

        const sensorInterval = setInterval(fetchSensorData, 3000);
        const alertInterval = setInterval(fetchAlerts, 5000);

        return () => {
            clearInterval(sensorInterval);
            clearInterval(alertInterval);
        };
    }, [fetchSensorData, fetchAlerts]);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-[1800px] mx-auto">
                <Header
                    onGenerateReport={handleGenerateReport}
                    isGenerating={isGeneratingReport}
                />

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                        <div className="grid grid-rows-2 gap-6 h-[calc(100vh-180px)]">
                            <div className="row-span-1">
                                <CityMap zones={zones} sensorData={sensorData} />
                            </div>
                            <div className="row-span-1">
                                <SensorCharts
                                    sensorData={sensorData}
                                    historyData={historyData}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <div className="grid grid-rows-2 gap-6 h-[calc(100vh-180px)]">
                            <div className="row-span-1">
                                <AlertsPanel alerts={alerts} />
                            </div>
                            <div className="row-span-1">
                                <AIInsights
                                    onAnalyze={handleAnalyze}
                                    analysis={aiAnalysis}
                                    isLoading={isAnalyzing}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
