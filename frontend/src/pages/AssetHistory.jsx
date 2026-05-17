import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Download,
  Search,
  Filter,
  Compass,
  Signal,
  Clock,
  Database,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatusBadge } from '../components/ItemGrid';

const AssetHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All'); // 'All', 'Very Close', 'Nearby', 'Far Away'
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('/api/items');
        setItems(data);

        // Generate high-quality mock chronological logs representing simulated telemetry updates over the past 24 hours
        const logs = [];
        const times = ["08:30", "09:45", "11:10", "12:50", "14:15", "15:40", "17:00", "18:25", "20:00", "21:30"];

        data.forEach((item) => {
          // Generate 3-4 historical datapoints for each asset
          const hashVal = item.tagId.charCodeAt(item.tagId.length - 1) || 5;
          const points = [
            { time: times[hashVal % 10], rssi: -90, status: 'Far Away' },
            { time: times[(hashVal + 2) % 10], rssi: -75, status: 'Nearby' },
            { time: times[(hashVal + 5) % 10], rssi: -50, status: 'Very Close' },
            { time: 'Active', rssi: item.rssi, status: item.status }
          ];

          points.forEach((pt, pIdx) => {
            logs.push({
              id: item._id + pIdx,
              itemName: item.itemName,
              tagId: item.tagId,
              rssi: pt.rssi,
              status: pt.status,
              time: pt.time === 'Active' ? 'Just now' : `${pt.time} (Today)`,
              timestamp: pt.time === 'Active' ? new Date() : new Date(Date.now() - (10 - pIdx) * 3600000)
            });
          });
        });

        // Sort by timestamp descending
        logs.sort((a, b) => b.timestamp - a.timestamp);
        setHistoryLogs(logs);

      } catch (err) {
        console.error('Failed to load history metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter logs
  const filteredLogs = historyLogs.filter(log => {
    const matchesSearch =
      log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tagId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAsset = selectedAsset === 'All' || log.itemName === selectedAsset;
    const matchesFilter = historyFilter === 'All' || log.status === historyFilter;

    return matchesSearch && matchesAsset && matchesFilter;
  });

  // Calculate dynamic line chart telemetry points for selected asset
  const getChartData = () => {
    if (items.length === 0) return [];

    // Choose which asset to plot
    const targetAsset = selectedAsset === 'All' ? items[0]?.itemName : selectedAsset;
    const assetLogs = historyLogs
      .filter(log => log.itemName === targetAsset)
      .reverse(); // Chronological order

    return assetLogs.map(log => ({
      time: log.time.split(' ')[0], // just the time block
      RSSI: log.rssi
    }));
  };

  const chartData = getChartData();

  // Export logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp,Asset Name,RFID Tag ID,Proximity Status,RSSI (dBm)\n'];
    const rows = filteredLogs.map(log =>
      `"${log.time}","${log.itemName}","${log.tagId}","${log.status}",${log.rssi}`
    );

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Asset_Proximity_Telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >

      {/* Upper Selector banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" />
            Asset Telemetry Signal History
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Chronological signal strength records</p>
        </div>

        {/* Dropdown selectors for plotting */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">Select Plot:</span>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 dark:text-slate-350 cursor-pointer max-w-[160px] sm:max-w-none"
          >
            <option value="All">All Assets (Default First)</option>
            {items.map(item => (
              <option key={item._id} value={item.itemName}>{item.itemName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Time-Series Chart */}
      <div className="rounded-3xl glass-panel p-6 shadow-sm min-h-[300px] flex flex-col justify-between">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingDown className="h-4.5 w-4.5 text-indigo-500" />
              RSSI Fluctuations Log
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">
              Time Series Graph for: {selectedAsset === 'All' ? items[0]?.itemName || 'Unregistered' : selectedAsset}
            </p>
          </div>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Values closer to 0 indicate proximity
          </div>
        </div>

        <div className="flex-1 min-h-[200px] w-full mt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Database className="h-8 w-8 mb-2 opacity-30" />
              <span className="text-xs">No coordinates plotted. Select or add assets to plot.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRssi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-indigo-500)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-indigo-500)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="text-slate-450 dark:text-slate-500 text-[10px] font-bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-slate-450 dark:text-slate-500 text-[10px] font-bold"
                  domain={[-100, -30]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl shadow-lg text-xs space-y-0.5">
                          <p className="text-[10px] text-slate-450 font-bold">Time: {payload[0].payload.time}</p>
                          <p className="font-bold text-indigo-400">Signal: {payload[0].value} dBm</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="RSSI"
                  stroke="var(--color-indigo-500)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRssi)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Detailed telemetries logs list */}
      <div className="space-y-4">

        {/* Filters and search toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-colors duration-300">

          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute inset-y-0 left-3 h-5 w-5 my-auto text-slate-405 pointer-events-none" />
              <input
                type="text"
                placeholder="Search history items..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {['All', 'Very Close', 'Nearby', 'Far Away'].map((status) => (
                <button
                  key={status}
                  onClick={() => setHistoryFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${historyFilter === status
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Download CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Download className="h-4 w-4 text-indigo-550" />
            Export Telemetry Log
          </button>

        </div>

        {/* Chronological Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
            <Compass className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 border-dashed">
            <Database className="mx-auto h-10 w-10 text-slate-350 dark:text-slate-700" />
            <h4 className="mt-2.5 text-xs font-bold text-slate-800 dark:text-white">No history records matched</h4>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">Please adjust filters or search query parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-900/40">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Asset Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">RFID Tag ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Telemetry State</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Signal Strength</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-500/80" />
                      {log.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{log.itemName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-450 dark:text-slate-500 font-semibold">
                      {log.tagId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {log.rssi} dBm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </motion.div>
  );
};

export default AssetHistory;
