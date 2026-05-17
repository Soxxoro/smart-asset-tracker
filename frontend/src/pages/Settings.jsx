import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Cpu,
  Volume2,
  Globe,
  Save,
  Play,
  Square,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    username: 'admin.operator',
    fullName: 'Admin User',
    email: 'operator@locator.pro',
    stationName: 'Central Scanning Base 01'
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sound_enabled') === 'true';
  });

  const [simulationActive, setSimulationActive] = useState(() => {
    return localStorage.getItem('simulation_active') === 'true';
  });

  const [simInterval, setSimInterval] = useState(() => {
    return Number(localStorage.getItem('simulation_interval')) || 6;
  });

  const [apiEndpoint, setApiEndpoint] = useState('/api/items');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simRunningLogs, setSimRunningLogs] = useState([]);

  // Simulation telemetry loop
  useEffect(() => {
    localStorage.setItem('simulation_active', simulationActive ? 'true' : 'false');
    localStorage.setItem('simulation_interval', simInterval.toString());
    localStorage.setItem('sound_enabled', soundEnabled ? 'true' : 'false');

    if (!simulationActive) return;

    const runTelemetrySimulation = async () => {
      try {
        const { data: items } = await axios.get('/api/items');
        if (items.length === 0) {
          setSimRunningLogs(prev => ["No assets registered to simulate.", ...prev].slice(0, 3));
          return;
        }

        // Select a random asset to update
        const randomIndex = Math.floor(Math.random() * items.length);
        const itemToUpdate = items[randomIndex];

        // Fluctuate RSSI randomly between -95 and -35 dBm
        const delta = Math.floor(Math.random() * 21) - 10; // +/- 10
        let newRssi = itemToUpdate.rssi + delta;
        if (newRssi < -100) newRssi = -95;
        if (newRssi > -30) newRssi = -35;

        // Determine Proximity status
        let newStatus = 'Far Away';
        if (newRssi >= -60) newStatus = 'Very Close';
        else if (newRssi >= -85) newStatus = 'Nearby';

        const updatedData = {
          itemName: itemToUpdate.itemName,
          tagId: itemToUpdate.tagId,
          rssi: newRssi,
          status: newStatus
        };

        // PUT request
        await axios.put(`/api/items/${itemToUpdate._id}`, updatedData);

        const logMsg = `Simulating ESP32: Updated "${itemToUpdate.itemName}" signal to ${newRssi} dBm (${newStatus})`;
        setSimRunningLogs(prev => [logMsg, ...prev].slice(0, 3));

      } catch (err) {
        console.error('Simulation step failed', err);
        setSimRunningLogs(prev => ["Simulation connection interrupted.", ...prev].slice(0, 3));
      }
    };

    // Run immediately and start interval
    runTelemetrySimulation();
    const interval = setInterval(runTelemetrySimulation, simInterval * 1000);

    return () => clearInterval(interval);
  }, [simulationActive, simInterval]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6"
    >

      {/* Dynamic Success floating banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold text-xs"
          >
            <CheckCircle className="h-4.5 w-4.5" />
            Configurations updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split configurations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Navigation settings cards list */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl glass-panel p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-855 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-indigo-500" />
              Settings Sections
            </h3>

            <div className="space-y-1">
              <a href="#profile" className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 border border-slate-200/20">
                User profile
              </a>
              <a href="#simulation" className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                ESP32 Hardware Simulation
              </a>
              <a href="#system" className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                API & Sounds Config
              </a>
            </div>
          </div>

          {/* Active Sim State Info */}
          {simulationActive && (
            <div className="rounded-3xl glass-panel p-5 border border-indigo-500/15 bg-indigo-500/5 shadow-sm space-y-3">
              <h4 className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 animate-bounce" />
                Sim Telemetry running
              </h4>

              <div className="space-y-2 text-[10px] font-mono text-slate-500 dark:text-slate-450 leading-relaxed max-h-[100px] overflow-y-auto">
                {simRunningLogs.length === 0 ? (
                  <span className="italic">Initializing simulated feeds...</span>
                ) : (
                  simRunningLogs.map((log, idx) => (
                    <div key={idx} className="pb-1 last:pb-0 border-b border-slate-100 dark:border-slate-850/60 break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right detail settings forms panels */}
        <div className="md:col-span-2 space-y-6">

          {/* Section 1: User Profile */}
          <div id="profile" className="rounded-3xl glass-panel p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
                <User className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-855 dark:text-white">Operator Profile Settings</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Configure your admin user credentials</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase">Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100"
                >
                  <Save className="h-4 w-4" />
                  Save profile details
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Simulation */}
          <div id="simulation" className="rounded-3xl glass-panel p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-855 dark:text-white">ESP32 Hardware Simulation Engine</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Simulates signal fluctuations without microcontrollers</p>
                </div>
              </div>

              <button
                onClick={() => setSimulationActive(!simulationActive)}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${simulationActive
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-650 dark:text-indigo-400'
                  }`}
              >
                {simulationActive ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-rose-600" />
                    <span>Stop Sim</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-indigo-600 dark:fill-indigo-400" />
                    <span>Start Sim</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-450">
                  <span>Simulation Tick Frequency</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{simInterval} seconds</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={simInterval}
                    onChange={(e) => setSimInterval(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 dark:accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850/80 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                💡 **MERN Synchronization**: When enabled, the settings dashboard runs a tick trigger in the background. Every tick, it selects an item at random in MongoDB via the MERN `/api/items` API, fluctuations its RSSI parameter slightly, and writes it back, giving you a completely active mock application with dynamic graphs and live radar sweeps!
              </div>
            </div>
          </div>

          {/* Section 3: Audio preferences & API Connections */}
          <div id="system" className="rounded-3xl glass-panel p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-855 dark:text-white">API & Proximity Audio Controls</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Configure connection endpoints and audios</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="h-5 w-5 text-indigo-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">Active Sonar sound</span>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Audio pings when clicking nodes on tracking radar</p>
                  </div>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${soundEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase">Gateway REST API Endpoint</label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default SettingsPage;
