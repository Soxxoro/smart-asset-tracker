import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Box, Info } from 'lucide-react';

const ItemModal = ({ isOpen, onClose, item, onSuccess }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    tagId: '',
    rssi: -100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName,
        tagId: item.tagId,
        rssi: item.rssi
      });
    } else {
      setFormData({
        itemName: '',
        tagId: '',
        rssi: -70
      });
    }
    setError('');
  }, [item, isOpen]);

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

    try {
      if (item) {
        // Update
        await axios.put(`/api/items/${item._id}`, formData);
      } else {
        // Create
        await axios.post('/api/items', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status simulation label helpers (Aligned with MERN backend)
  const getProximityText = (rssi) => {
    if (rssi > -45) return { label: 'Very Close', color: 'text-emerald-500 bg-emerald-500/10' };
    if (rssi > -60) return { label: 'Nearby', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Far Away', color: 'text-rose-500 bg-rose-500/10' };
  };

  const proximity = getProximityText(formData.rssi);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 space-y-6"
          >
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-850 dark:text-white">
                    {item ? 'Modify Asset Details' : 'Add New Active Asset'}
                  </h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    {item ? 'Editing item config' : 'Register RFID identifier'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-500/5 text-rose-600 dark:text-rose-450 text-xs p-3.5 rounded-xl border border-rose-500/20 font-bold">
                  {error}
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
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Master Bedroom Keys"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                  RFID Tag Identifier
                </label>
                <input
                  type="text"
                  name="tagId"
                  required
                  disabled={!!item}
                  value={formData.tagId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  placeholder="e.g. TAG-28492"
                />
                {item ? (
                  <p className="text-[10px] text-slate-450 font-medium">Tag ID cannot be modified after registration.</p>
                ) : (
                  <p className="text-[10px] text-slate-450 font-medium">Ensure this matches your ESP32's scanned code.</p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                    Simulate Signal RSSI Strength
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
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-xl w-20 text-center shrink-0 shadow-sm text-indigo-600 dark:text-indigo-400">
                    {formData.rssi} dBm
                  </span>
                </div>
                
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 px-1 font-semibold">
                  <span>Out of range (-100)</span>
                  <span>Touching (-30)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/15 transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Saving settings...</span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {item ? 'Save Configuration' : 'Confirm Registration'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ItemModal;
