import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Compass, 
  Search,
  Check
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Alert', 'Warning', 'Info'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await axios.get('/api/items');
        
        // Generate simulated dynamic alerts from items state
        const generated = [];
        data.forEach((item, idx) => {
          if (item.status === 'Far Away') {
            generated.push({
              id: item._id + 'a',
              title: 'Critical: Asset Connection Lost',
              message: `Registered tracker for "${item.itemName}" (${item.tagId}) is out of range. Current signal is ${item.rssi} dBm.`,
              type: 'Alert',
              time: '12 min ago',
              read: false,
              icon: AlertCircle,
              color: 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400'
            });
          } else if (item.status === 'Nearby') {
            generated.push({
              id: item._id + 'w',
              title: 'Warning: Proximity Signal Fading',
              message: `Asset "${item.itemName}" (${item.tagId}) signal is weakening (${item.rssi} dBm). Proximity category shifted to Nearby.`,
              type: 'Warning',
              time: '1 hour ago',
              read: false,
              icon: AlertTriangle,
              color: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400'
            });
          } else {
            generated.push({
              id: item._id + 'i',
              title: 'Info: Proximity Connection Established',
              message: `Asset "${item.itemName}" (${item.tagId}) has been successfully detected at close proximity (${item.rssi} dBm).`,
              type: 'Info',
              time: '2 hours ago',
              read: true,
              icon: CheckCircle2,
              color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
            });
          }
        });

        // Add some standard template notifications if the list is small
        if (generated.length < 3) {
          generated.push({
            id: 'sys-1',
            title: 'System: ESP32 Broker Online',
            message: 'Central ESP32 scanning hub successfully established local MQTT broker connection.',
            type: 'Info',
            time: '3 hours ago',
            read: true,
            icon: Info,
            color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400'
          });
        }

        setNotifications(generated);
      } catch (err) {
        console.error('Failed to construct alert list', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markSingleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteSingle = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter logs
  const filteredAlerts = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All' || n.type === filterType;

    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500 animate-pulse" />
            System Alert Feed
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Hardware alert logs & notifications</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
          
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-500/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Clear Feed
          </button>
        </div>
      </div>

      {/* Alert Feed Control Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute inset-y-0 left-3 h-5 w-5 my-auto text-slate-405 pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0">
          {['All', 'Alert', 'Warning', 'Info'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
              }`}
            >
              {type === 'Alert' ? 'Critical Alerts' : type === 'Warning' ? 'Warnings' : type === 'Info' ? 'Info Messages' : 'All Feeds'}
            </button>
          ))}
        </div>

      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
            <Bell className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">Alert feed cleared!</h3>
            <p className="mt-1 text-xs text-slate-405 dark:text-slate-500 font-medium">All tracking transmitters report optimal signals.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence>
              {filteredAlerts.map((n) => {
                const AlertIcon = n.icon;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 25 }}
                    className={`flex items-start gap-4 p-4 rounded-3xl border glass-panel shadow-sm transition-all ${
                      n.read ? 'opacity-80' : ''
                    }`}
                  >
                    
                    {/* Action Icon block */}
                    <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 border ${n.color}`}>
                      <AlertIcon className="h-4.5 w-4.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {n.title}
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 inline-block animate-pulse shrink-0" />
                          )}
                        </h4>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                        {n.message}
                      </p>
                    </div>

                    {/* Quick controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      {!n.read && (
                        <button
                          onClick={() => markSingleRead(n.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteSingle(n.id)}
                        className="p-1.5 text-slate-405 hover:text-rose-550 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Notifications;
