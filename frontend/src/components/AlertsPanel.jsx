import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';

const AlertsPanel = ({ alerts, onDismiss }) => {
    const getSeverityConfig = (severity) => {
        switch (severity) {
            case 'critical':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    iconColor: 'text-red-400',
                    textColor: 'text-red-300'
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-amber-500/10',
                    borderColor: 'border-amber-500/30',
                    iconColor: 'text-amber-400',
                    textColor: 'text-amber-300'
                };
            default:
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/30',
                    iconColor: 'text-blue-400',
                    textColor: 'text-blue-300'
                };
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const activeAlerts = alerts?.filter(a => !a.resolved) || [];

    return (
        <div className="glass-card p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
                <span className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                    {activeAlerts.length} Active
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {activeAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <CheckCircle className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">All systems operational</p>
                    </div>
                ) : (
                    activeAlerts.map((alert, index) => {
                        const config = getSeverityConfig(alert.severity);
                        const Icon = config.icon;

                        return (
                            <div
                                key={alert.id || index}
                                className={`alert-item p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`font-medium ${config.textColor}`}>
                                                {alert.zone_name}
                                            </span>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {formatTime(alert.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                            {alert.message}
                                        </p>
                                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${config.bgColor} ${config.textColor}`}>
                                            {alert.alert_type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
