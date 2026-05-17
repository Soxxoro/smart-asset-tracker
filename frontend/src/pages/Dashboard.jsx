import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Box,
  TrendingUp,
  MapPin,
  Compass,
  HelpCircle,
  Clock,
  Sparkles,
  WifiOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ItemGrid from '../components/ItemGrid';
import ItemModal from '../components/ItemModal';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Very Close', 'Nearby', 'Far Away'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await axios.get('/api/items');
      setItems(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Connection interrupted. Please verify backend state.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and background auto-refresh every 5 seconds
  useEffect(() => {
    fetchItems(true);
    const interval = setInterval(() => {
      fetchItems(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this registered asset?')) {
      try {
        await axios.delete(`/api/items/${id}`);
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete asset');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Filtering + Searching logic
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'All' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Calculate Metrics
  const totalAssets = items.length;
  const nearbyAssets = items.filter(i => i.status === 'Very Close' || i.status === 'Nearby').length;
  const missingAssets = items.filter(i => i.status === 'Far Away').length;

  // Chart data mapping: RSSI is negative, let's map proximity score (0 to 100) for better plotting
  const getProximityScore = (rssi) => {
    if (rssi <= -100) return 10;
    if (rssi >= -30) return 100;
    return Math.round(((rssi - (-100)) / 70) * 100);
  };

  const chartData = items.slice(0, 8).map(item => ({
    name: item.itemName.length > 12 ? `${item.itemName.substring(0, 10)}...` : item.itemName,
    Proximity: getProximityScore(item.rssi),
    rssi: item.rssi,
    status: item.status
  }));

  // Mock activity logs dynamically built from current items
  const getActivityLogs = () => {
    if (items.length === 0) return [];
    return items.slice(0, 4).map((item, idx) => {
      const actions = [
        { verb: "detected nearby", desc: "Signal strength stabilized at", color: "text-amber-500 bg-amber-500/10" },
        { verb: "entered zone", desc: "Proximity reported as", color: "text-emerald-500 bg-emerald-500/10" },
        { verb: "proximity modified", desc: "RSSI simulation adjusted to", color: "text-indigo-500 bg-indigo-500/10" },
        { verb: "reported offline", desc: "Went out of visual range", color: "text-rose-500 bg-rose-500/10" }
      ];

      const act = actions[idx % actions.length];
      return {
        id: item._id + idx,
        asset: item.itemName,
        verb: act.verb,
        desc: `${act.desc} ${item.rssi} dBm (${item.status})`,
        time: idx === 0 ? "Just now" : `${idx * 4} min ago`,
        color: act.color
      };
    });
  };

  const activities = getActivityLogs();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >

      {/* Top Banner Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Assets */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 shadow-sm flex items-center gap-5 group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-indigo-500/10">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total Reg Assets</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 leading-none">{totalAssets}</h3>
          </div>
        </div>

        {/* Nearby Proximity */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 shadow-sm flex items-center gap-5 group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Active In Proximity</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1 leading-none">{nearbyAssets}</h3>
          </div>
        </div>

        {/* Missing Assets */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 shadow-sm flex items-center gap-5 group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/10">
            <WifiOff className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Assets Out of Range</span>
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-455 mt-1 leading-none">{missingAssets}</h3>
          </div>
        </div>

      </div>

      {/* Analytics Graph + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Signal chart */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-6 shadow-sm flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                RFID Signal Strength Proximity Mapping
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Top assets Proximity Score (%)</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-xl text-slate-500 font-bold border border-slate-200/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Real-time feed
            </div>
          </div>

          <div className="flex-1 min-h-[220px] w-full mt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Compass className="h-8 w-8 mb-2 opacity-30 animate-spin" />
                <span className="text-xs">No active tag signals available to plot</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-500 text-[10px] font-bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-500 text-[10px] font-bold"
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 8 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">RSSI: {data.rssi} dBm</p>
                            <p className="text-[10px] text-slate-400">Proximity: {data.status}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Proximity" radius={[6, 6, 0, 0]} barSize={28}>
                    {chartData.map((entry, index) => {
                      let color = 'var(--color-rose-500)';
                      if (entry.status === 'Very Close') color = 'var(--color-emerald-500)';
                      else if (entry.status === 'Nearby') color = 'var(--color-amber-500)';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent activity list */}
        <div className="rounded-3xl glass-panel p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              Live Activity Tracker
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Automated signal changes</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-8">
                <Box className="h-8 w-8 mb-2 opacity-30" />
                <span className="text-xs">No recorded logs yet. Add an asset to begin.</span>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${act.color}`}>
                    {act.asset.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {act.asset}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{act.verb}</span>. {act.desc}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Main Asset Management Grid */}
      <div className="space-y-4">

        {/* Search, filters & buttons tool */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-colors duration-300">

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute inset-y-0 left-3 h-5 w-5 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search assets by tag or name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-slate-450 text-slate-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {['All', 'Very Close', 'Nearby', 'Far Away'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${filterStatus === status
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 border-slate-100 dark:border-slate-850 pt-3 md:pt-0 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold hidden sm:inline">
                Last checked: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              <button
                onClick={() => fetchItems(true)}
                className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer"
                title="Refresh Assets"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/15 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4" />
              Register Asset
            </button>
          </div>

        </div>

        {/* Content displays */}
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-455">System Connection Fault</h4>
              <p className="text-xs text-rose-500/90 dark:text-rose-400/90 mt-1 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
            <h4 className="text-xs font-bold text-slate-855 dark:text-slate-200">Interrogating RFID Reader...</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 uppercase tracking-wide">Syncing signal metrics</p>
          </div>
        ) : filteredItems.length === 0 && !error ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed transition-all">
            <Box className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-700 animate-bounce" />
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">No registered assets matched</h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'All'
                ? 'Try adjusting your search keywords or state filters.'
                : 'Get started by creating a new asset or connecting your ESP32.'}
            </p>
            {!searchQuery && filterStatus === 'All' && (
              <button
                onClick={handleAddNew}
                className="mt-6 inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-650 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add your first asset
              </button>
            )}
          </div>
        ) : (
          <ItemGrid items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
        )}

      </div>

      {/* Asset create/edit modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        onSuccess={() => fetchItems(false)}
      />

    </motion.div>
  );
};

export default Dashboard;
