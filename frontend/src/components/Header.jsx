import React from 'react';
import { Activity, Map, Bell, Cpu, Download } from 'lucide-react';

const Header = ({ onGenerateReport, isGenerating }) => {
    return (
        <header className="glass-card px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-effect">
                        <Cpu className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Smart City Digital Twin
                        </h1>
                        <p className="text-slate-400 text-sm">Real-time urban monitoring & AI insights</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse"></span>
                        <span className="text-emerald-400 text-sm font-medium">Live</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <Map className="w-5 h-5" />
                            <span className="text-sm">Map</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <Activity className="w-5 h-5" />
                            <span className="text-sm">Analytics</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <span className="text-sm">Alerts</span>
                        </div>
                    </div>

                    <button
                        onClick={onGenerateReport}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <div className="loading-spinner"></div>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                <span>Download Report</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
