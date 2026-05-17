import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  RefreshCw, 
  MapPin, 
  Signal, 
  Radio, 
  Volume2, 
  VolumeX, 
  Eye, 
  Box,
  Compass
} from 'lucide-react';
import { StatusBadge } from '../components/ItemGrid';

const LiveTracking = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activePing, setActivePing] = useState(null); // ID of item being pinged
  const [lastCheck, setLastCheck] = useState(new Date());

  const fetchItems = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await axios.get('/api/items');
      
      // Seed consistent angles for assets based on their database ID so they don't jump around randomly
      const mappedItems = data.map((item, idx) => {
        // Derive a semi-stable angle from tagId or index
        let hash = 0;
        for (let i = 0; i < item.tagId.length; i++) {
          hash = item.tagId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const angle = Math.abs(hash % 360);
        
        // Map RSSI (-100 to -30) to polar radius percentage (15% to 85%)
        const minR = 15;
        const maxR = 85;
        const rssiValue = Math.min(Math.max(item.rssi, -100), -30);
        // radius percentage decreases as RSSI gets closer to -30 (closer to center)
        const pct = (rssiValue - (-100)) / 70; // 0 (far) to 1 (close)
        const radius = maxR - pct * (maxR - minR); // 85 (far) to 15 (close)

        return {
          ...item,
          angle,
          radius
        };
      });

      setItems(mappedItems);
      setLastCheck(new Date());
    } catch (err) {
      console.error('Failed to get items for tracking radar', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
    const interval = setInterval(() => {
      fetchItems(false);
    }, 4000); // Poll every 4 seconds for real-time tracking
    return () => clearInterval(interval);
  }, []);

  const triggerSonarPing = (itemId) => {
    setActivePing(itemId);
    
    // Simulate high-tech beep audio using HTML5 Web Audio API if sound is enabled!
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Dynamic oscillator for futuristic sonar sweep beep
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.6); // Sweep down
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8); // Fade
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (err) {
        console.warn('Web Audio blocked or unsupported', err);
      }
    }

    setTimeout(() => {
      setActivePing(null);
    }, 2500);
  };

  // Convert polar coordinates (angle, radius) to CSS percentages (x, y) relative to radar center (50%, 50%)
  const polarToXY = (angle, radiusPct) => {
    const angleRad = (angle * Math.PI) / 180;
    const x = 50 + (radiusPct / 2) * Math.cos(angleRad);
    const y = 50 + (radiusPct / 2) * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-500 animate-pulse" />
            Live Proximity Tracking Radar
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Continuous RFID signal visualizer</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              soundEnabled 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-650 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-405'
            }`}
            title={soundEnabled ? 'Disable Sonar Sound' : 'Enable Sonar Sound'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">Audio Feedback</span>
          </button>
          
          <button
            onClick={() => fetchItems(true)}
            className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer"
            title="Scan items"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Radar + Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Circular Active Radar */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-6 shadow-sm flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
          
          {/* Radar background grids */}
          <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />

          {/* Glowing scanner frame */}
          <div className="w-full max-w-[380px] sm:max-w-[420px] aspect-square rounded-full border border-indigo-500/15 dark:border-indigo-500/25 relative flex items-center justify-center p-6 shadow-[inset_0_0_40px_rgba(99,102,241,0.02)]">
            
            {/* Radar Center glowing core */}
            <div className="h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 z-10 shadow-[0_0_12px_rgba(99,102,241,0.8)] relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
            </div>

            {/* Polar sweeping scanning beam */}
            <div className="absolute inset-0 w-full h-full rounded-full pointer-events-none animate-radar-sweep origin-center z-0" 
                 style={{ 
                   background: 'conic-gradient(from 0deg, rgba(99, 102, 241, 0.15) 0deg, rgba(99, 102, 241, 0.03) 40deg, transparent 180deg)' 
                 }} 
            />

            {/* Concentric Range Rings */}
            {/* Inner - Very Close (30% size) */}
            <div className="absolute w-[30%] h-[30%] rounded-full border border-indigo-500/10 dark:border-indigo-500/15 flex items-center justify-center">
              <span className="absolute -top-3.5 text-[9px] text-emerald-500/80 font-bold uppercase tracking-wide">Very Close</span>
            </div>
            
            {/* Middle - Nearby (65% size) */}
            <div className="absolute w-[65%] h-[65%] rounded-full border border-indigo-500/10 dark:border-indigo-500/15 flex items-center justify-center">
              <span className="absolute -top-3.5 text-[9px] text-amber-500/80 font-bold uppercase tracking-wide">Nearby</span>
            </div>

            {/* Outer - Far Away (95% size) */}
            <div className="absolute w-[95%] h-[95%] rounded-full border border-indigo-500/10 dark:border-indigo-500/15 flex items-center justify-center">
              <span className="absolute -top-3.5 text-[9px] text-rose-500/80 font-bold uppercase tracking-wide">Far Away</span>
            </div>

            {/* Crosshair horizontal/vertical visual guide lines */}
            <div className="absolute inset-0 m-auto w-full h-[1px] bg-indigo-500/5 pointer-events-none" />
            <div className="absolute inset-0 m-auto w-[1px] h-full bg-indigo-500/5 pointer-events-none" />

            {/* Dynamic Asset Dots Rendered on Polar Angles */}
            {items.map((item) => {
              const { x, y } = polarToXY(item.angle, item.radius);
              const isItemPinged = activePing === item._id;

              return (
                <motion.div
                  key={item._id}
                  className="absolute z-20 cursor-pointer group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => triggerSonarPing(item._id)}
                  whileHover={{ scale: 1.3 }}
                >
                  {/* Glowing active node dot */}
                  <span className={`relative flex h-3.5 w-3.5 -mt-1.75 -ml-1.75`}>
                    
                    {/* Glowing pulsators */}
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      item.status === 'Very Close' ? 'bg-emerald-400' :
                      item.status === 'Nearby' ? 'bg-amber-400' : 'bg-rose-400'
                    }`}></span>

                    {/* Sonar Ping Visual Ring Wave */}
                    {(isItemPinged) && (
                      <span className="absolute -inset-8 rounded-full border border-indigo-500/40 animate-ping-slow pointer-events-none" />
                    )}
                    
                    {/* Primary Dot Center */}
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border border-white dark:border-slate-900 shadow-md ${
                      item.status === 'Very Close' ? 'bg-emerald-500' :
                      item.status === 'Nearby' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>

                  </span>

                  {/* Floating Tag Hover Tooltip */}
                  <div className="absolute left-5 -top-3.5 bg-slate-900/90 border border-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap scale-0 group-hover:scale-100 transition-all z-[99] max-w-xs">
                    <div>{item.itemName}</div>
                    <div className="text-[8px] text-slate-400 font-mono mt-0.5">{item.rssi} dBm Proximity</div>
                  </div>
                </motion.div>
              );
            })}

          </div>

          <div className="mt-6 flex justify-center gap-6 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              Very Close (&lt; -60dBm)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              Nearby (&lt; -85dBm)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              Far Away (&gt; -86dBm)
            </div>
          </div>
        </div>

        {/* Side Panel: Active Signals Proximity Feed */}
        <div className="rounded-3xl glass-panel p-6 shadow-sm flex flex-col justify-between max-h-[530px]">
          
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-500" />
              Asset Signal Feed
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Select item to visual ping</p>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 mb-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-450 py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                <Box className="h-8 w-8 mb-2 opacity-30" />
                <span className="text-xs">No active tag signals available to track</span>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => triggerSonarPing(item._id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    activePing === item._id
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-400 shadow-sm'
                      : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.status === 'Very Close' ? 'bg-emerald-500/10 text-emerald-600' :
                      item.status === 'Nearby' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-650'
                    }`}>
                      {item.itemName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                        {item.itemName}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                        <Signal className="h-3 w-3" />
                        <span>{item.rssi} dBm</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={item.status} />
                    <span className="text-[8px] text-slate-400 font-mono">Ping tracker</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => fetchItems(true)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-2xl text-xs font-bold transition-all hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer active:scale-98"
            >
              <Radio className="h-4 w-4 text-indigo-500" />
              Force Radar Sweep
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default LiveTracking;
