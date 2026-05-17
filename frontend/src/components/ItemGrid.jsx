import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Signal, 
  MapPin, 
  Clock, 
  Hash, 
  LayoutGrid, 
  List, 
  AlertCircle 
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Very Close': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-550/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
    'Nearby': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-550/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
    'Far Away': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-550/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
  };

  const labels = {
    'Very Close': 'Very Close',
    'Nearby': 'Nearby',
    'Far Away': 'Far Away'
  };

  const defaultStyle = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-550/20';

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 w-fit ${styles[status] || defaultStyle}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'Very Close' ? 'bg-emerald-500' :
        status === 'Nearby' ? 'bg-amber-500' : 'bg-rose-500'
      }`} />
      {labels[status] || status || 'Unknown'}
    </span>
  );
};

const SignalStrengthIndicator = ({ rssi }) => {
  // Map RSSI (-100 to -30) to percentage (0 to 100)
  const getPercentage = () => {
    if (rssi <= -100) return 0;
    if (rssi >= -30) return 100;
    return Math.round(((rssi - (-100)) / 70) * 100);
  };

  const pct = getPercentage();
  
  // Decide color based on percentage
  const getColorClass = () => {
    if (pct > 70) return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]';
    if (pct > 40) return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]';
    return 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.3)]';
  };

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColorClass()}`}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-450 shrink-0">
        {rssi} dBm
      </span>
    </div>
  );
};

const ItemGrid = ({ items, onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle Header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-450 pl-2">
          Displaying {items.length} registered asset{items.length === 1 ? '' : 's'}
        </span>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200/20">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          /* Grid View Mode */
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                className="group relative rounded-2xl glass-panel p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Visual Accent Glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  item.status === 'Very Close' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                  item.status === 'Nearby' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                  'bg-gradient-to-r from-rose-400 to-pink-500'
                }`} />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors truncate max-w-[180px]">
                      {item.itemName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      <Hash className="h-3 w-3 shrink-0" />
                      <span>{item.tagId}</span>
                    </div>
                  </div>

                  <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Proximity
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Signal className="h-3.5 w-3.5" />
                      RFID RSSI Signal
                    </span>
                    <SignalStrengthIndicator rssi={item.rssi} />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last update:
                    </span>
                    <span className="font-medium">
                      {new Date(item.updatedAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Table/List View Mode */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40"
          >
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-900/40">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Asset Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">RFID Tag ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Proximity Proximity</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Signal Strengths</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-450 uppercase tracking-wider">Last Seen</th>
                  <th scope="col" className="relative px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          item.status === 'Very Close' ? 'bg-emerald-500/10 text-emerald-600' :
                          item.status === 'Nearby' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-650'
                        }`}>
                          {item.itemName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-450 font-medium">
                      {item.tagId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-44">
                      <SignalStrengthIndicator rssi={item.rssi} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-450 font-medium">
                      {new Date(item.updatedAt || new Date()).toLocaleString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Extracted dropdown action menu */
const ActionMenu = ({ item, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
      >
        <MoreVertical className="h-4.5 w-4.5" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-30"
          >
            <button
              onClick={() => onEdit(item)}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-500" /> 
              Edit Asset
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-500/5 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> 
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemGrid;
export { StatusBadge, SignalStrengthIndicator };
