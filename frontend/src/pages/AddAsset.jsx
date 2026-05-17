import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Box,
  Wifi,
  HelpCircle,
  Hash,
  Compass,
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';

const AddAsset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    tagId: '',
    rssi: -70
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rssi' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/api/items', formData);
      setSuccess(true);

      // Delay navigation slightly so they see success state
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'RFID Tag ID must be unique. Choose another tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProximityText = (rssi) => {
    if (rssi > -45) return { label: 'Very Close', color: 'text-emerald-500 bg-emerald-500/10' };
    if (rssi > -60) return { label: 'Nearby', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Far Away', color: 'text-rose-500 bg-rose-500/10' };
  };

  const proximity = getProximityText(formData.rssi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6"
    >

      {/* Return button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </button>

      {/* Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Left Form: Column 1-3 */}
        <div className="md:col-span-3 rounded-3xl glass-panel p-6 shadow-sm space-y-6">

          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-500" />
              Register New Active RFID Tag
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Map static assets to simulated ESP32 trackers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/5 text-rose-600 dark:text-rose-455 text-xs p-3.5 rounded-xl border border-rose-500/20 font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 text-xs p-3.5 rounded-xl border border-emerald-500/20 font-bold">
                Asset Registered Successfully! Routing to Dashboard...
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                Asset Display Name
              </label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-800 dark:text-white font-medium"
                placeholder="e.g. Living Room TV remote"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                RFID Tag ID (Scanned tag)
              </label>
              <div className="relative">
                <Hash className="absolute inset-y-0 left-3.5 h-4 w-4 my-auto text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="tagId"
                  required
                  value={formData.tagId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all placeholder-slate-450 text-slate-800 dark:text-white font-mono"
                  placeholder="e.g. TAG-82947"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                  Initial Proximity Simulation
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${proximity.color}`}>
                  {proximity.label}
                </span>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <input
                  type="range"
                  name="rssi"
                  min="-100"
                  max="-30"
                  value={formData.rssi}
                  onChange={handleChange}
                  className="flex-1 accent-indigo-600 dark:accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-xl w-20 text-center shrink-0 shadow-sm text-indigo-650 dark:text-indigo-400">
                  {formData.rssi} dBm
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-650 text-white p-3.5 rounded-2xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/15 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Registering asset parameters...</span>
                ) : (
                  <>
                    <span>Confirm Asset Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right Info Details: Column 4-5 */}
        <div className="md:col-span-2 space-y-6">

          <div className="rounded-3xl glass-panel p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-855 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-500" />
              Registration Tips
            </h3>

            <div className="space-y-4 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Unique Tag Keys</span>
                <p>Every scanned tag requires a completely unique RFID identifier. Duplicate TAG IDs will trigger a database duplicate warning.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Initial Signal RSSI</span>
                <p>Initial Proximity ranges from **-30 dBm (touching range)** down to **-100 dBm (out of range/missing)**.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">ESP32 Interrogator Sync</span>
                <p>Once registered, standard ESP32 scanner firmware can instantly read and override these parameters during active loops.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl glass-panel p-5 shadow-sm border border-emerald-500/15 bg-emerald-500/5 flex gap-3">
            <Wifi className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider block">ESP32 Core Online</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                Hardware receiver is online and scanning on local broadcast channel. Fresh registrations sync within 1 second.
              </p>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default AddAsset;
