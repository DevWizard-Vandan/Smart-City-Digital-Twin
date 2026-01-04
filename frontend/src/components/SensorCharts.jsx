import React from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Car, Wind, Volume2, Zap, Droplets } from 'lucide-react';

const GaugeCard = ({ title, value, max, unit, icon: Icon, color, threshold }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isWarning = value > threshold;

    const gaugeData = [{ value: percentage, fill: isWarning ? '#ef4444' : color }];

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{title}</span>
                </div>
                {isWarning && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                        HIGH
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <span className="text-3xl font-bold text-white">{value?.toFixed(1) || 0}</span>
                    <span className="text-slate-400 ml-1">{unit}</span>
                </div>

                <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="60%"
                            outerRadius="100%"
                            data={gaugeData}
                            startAngle={180}
                            endAngle={0}
                        >
                            <RadialBar
                                background={{ fill: '#1e293b' }}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ChartCard = ({ title, data, dataKey, color, type = 'area' }) => {
    const chartData = data?.slice(-20).map((reading, index) => ({
        time: index,
        value: reading[dataKey] || 0,
    })) || [];

    const ChartComponent = type === 'bar' ? BarChart : AreaChart;
    const DataComponent = type === 'bar' ? Bar : Area;

    return (
        <div className="chart-container">
            <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>
            <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ChartComponent data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="time"
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                        />
                        {type === 'bar' ? (
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        ) : (
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fill={`${color}30`}
                                strokeWidth={2}
                            />
                        )}
                    </ChartComponent>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SensorCharts = ({ sensorData, historyData }) => {
    const getAverageValue = (key) => {
        if (!sensorData || sensorData.length === 0) return 0;
        return sensorData.reduce((sum, s) => sum + (s[key] || 0), 0) / sensorData.length;
    };

    const gauges = [
        {
            title: 'Traffic Density',
            value: getAverageValue('traffic_density'),
            max: 100,
            unit: '%',
            icon: Car,
            color: '#3b82f6',
            threshold: 80
        },
        {
            title: 'Air Quality (AQI)',
            value: getAverageValue('air_quality'),
            max: 200,
            unit: '',
            icon: Wind,
            color: '#10b981',
            threshold: 100
        },
        {
            title: 'Noise Level',
            value: getAverageValue('noise_level'),
            max: 100,
            unit: 'dB',
            icon: Volume2,
            color: '#f59e0b',
            threshold: 75
        },
        {
            title: 'Power Usage',
            value: getAverageValue('electricity'),
            max: 100,
            unit: '%',
            icon: Zap,
            color: '#8b5cf6',
            threshold: 90
        },
        {
            title: 'Water Usage',
            value: getAverageValue('water_usage'),
            max: 100,
            unit: '%',
            icon: Droplets,
            color: '#06b6d4',
            threshold: 85
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
                {gauges.map((gauge, index) => (
                    <GaugeCard key={index} {...gauge} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <ChartCard
                    title="Traffic Trend"
                    data={historyData}
                    dataKey="traffic_density"
                    color="#3b82f6"
                />
                <ChartCard
                    title="Air Quality Trend"
                    data={historyData}
                    dataKey="air_quality"
                    color="#10b981"
                />
                <ChartCard
                    title="Power Consumption"
                    data={historyData}
                    dataKey="electricity"
                    color="#8b5cf6"
                    type="bar"
                />
            </div>
        </div>
    );
};

export default SensorCharts;
