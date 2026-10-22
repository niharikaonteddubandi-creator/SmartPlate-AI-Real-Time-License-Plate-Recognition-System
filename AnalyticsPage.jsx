import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Car, 
  Percent, 
  Clock, 
  Calendar, 
  RefreshCw,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#38a8f8', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

export default function AnalyticsPage({ setActivePage }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Could not fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400">
          Analytics are derived from your authenticated database records. Please sign in to view statistics.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-400" />
        <p className="text-sm font-semibold text-slate-300">Calculating real database analytics...</p>
      </div>
    );
  }

  // Prep source distribution for pie chart
  const sourceChartData = Object.entries(data.source_breakdown).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val
  }));

  // Prep confidence distribution for bar chart
  const confChartData = Object.entries(data.confidence_distribution).map(([key, val]) => ({
    bracket: key,
    count: val
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            Recognition Analytics
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
              LIVE SQLITE METRICS
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real performance telemetry, recognition volume, and accuracy breakdown.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scans */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Detections</span>
            <Activity className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {data.total_detections}
          </div>
          <p className="text-[11px] text-slate-500">All authenticated records logged</p>
        </div>

        {/* Unique Vehicles */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unique Registration #s</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {data.unique_plates}
          </div>
          <p className="text-[11px] text-slate-500">Deduplicated unique vehicle plates</p>
        </div>

        {/* Average Accuracy */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Confidence</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mb-1">
            {Math.round(data.avg_confidence * 100)}%
          </div>
          <p className="text-[11px] text-slate-500">Combined detection & OCR score</p>
        </div>

        {/* Scans Today */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Detections Today</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {data.detections_today}
          </div>
          <p className="text-[11px] text-slate-500">Logged since 00:00 UTC</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Trend Area Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              7-Day Detection Activity Trend
            </h3>
            <span className="text-xs text-slate-400">Total: {data.total_detections} events</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38a8f8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38a8f8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="count" stroke="#38a8f8" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" name="Detections" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Channels Distribution */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Source Channels
            </h3>
            <p className="text-xs text-slate-400 mb-4">Volume breakdown across input pipelines.</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            {sourceChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-mono font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Distribution & Recent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confidence Brackets Bar Chart */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Confidence Quality Distribution</h3>
          <p className="text-xs text-slate-400">Classification of detection confidence across all records.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="bracket" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38a8f8" radius={[6, 6, 0, 0]} name="Plate Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Stream */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Recognition Stream</h3>
            <button 
              onClick={() => setActivePage('history')}
              className="text-xs text-brand-400 hover:underline"
            >
              View Full History →
            </button>
          </div>

          <div className="space-y-2.5">
            {data.recent_activity.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent recognition activity.</p>
            ) : (
              data.recent_activity.map((rec) => (
                <div 
                  key={rec.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 text-slate-900 border border-slate-900 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                      {rec.registration_number}
                    </div>
                    <span className="capitalize text-slate-400 text-[11px]">{rec.source_type}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-brand-400 font-semibold">
                      {Math.round(rec.overall_confidence * 100)}%
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">
                      {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
