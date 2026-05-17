import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Wifi, 
  Sparkles 
} from 'lucide-react';

const Navbar = ({ toggleSidebar, toggleMobileSidebar, darkMode, setDarkMode, isSidebarCollapsed }) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);

  // Dynamic header title matching route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Asset Dashboard';
      case '/live': return 'Live Proximity Radar';
      case '/add': return 'Register New Asset';
      case '/history': return 'Activity Log & Signal History';
      case '/notifications': return 'System Alert Feed';
      case '/settings': return 'System Configurations';
      default: return 'Asset Tracker';
    }
  };

  // Mock Notification logs
  const quickAlerts = [
    { id: 1, text: "RFID TAG-084 moved VERY CLOSE", time: "2 min ago", type: 'success' },
    { id: 2, text: "Keys TAG-190 Signal Dropped", time: "12 min ago", type: 'warning' },
    { id: 3, text: "Wallet TAG-404 went MISSING", time: "1 hour ago", type: 'danger' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-20 glass-panel border-b border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors duration-300">
      
      {/* Left block */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white transition-all">
            {getPageTitle()}
          </h1>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
              RFID Tracker online
            </span>
          </div>
        </div>
      </div>

      {/* Right block: Action Tray */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Connection status tag */}
        <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Wifi className="h-3.5 w-3.5" />
          ESP32 Connected
        </div>

        {/* Global Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all active:scale-95 shrink-0"
          title="Toggle color theme"
        >
          {darkMode ? (
            <motion.div initial={{ rotate: -30 }} animate={{ rotate: 0 }}>
              <Sun className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div initial={{ rotate: 30 }} animate={{ rotate: 0 }}>
              <Moon className="h-5 w-5" />
            </motion.div>
          )}
        </button>

        {/* Dynamic Alerts quick tray */}
        <div className="relative">
          <button
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              setIsProfileOpen(false);
            }}
            className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all relative shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <AnimatePresence>
            {isAlertsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsAlertsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 p-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Recent Activities</span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">New Notifications</span>
                  </div>
                  
                  <div className="mt-2 divide-y divide-slate-50 dark:divide-slate-850">
                    {quickAlerts.map(alert => (
                      <div key={alert.id} className="py-2.5 first:pt-1 last:pb-1">
                        <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                          {alert.text}
                        </p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {alert.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <a 
                    href="/notifications" 
                    onClick={() => setIsAlertsOpen(false)}
                    className="block text-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    View All Logs
                  </a>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Card Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsAlertsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 transition-all text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/15 shrink-0">
              U
            </div>
            
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-850 dark:text-slate-100 leading-tight">Admin User</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">system.admin</div>
            </div>
            
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 p-4"
                >
                  <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-850">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      AD
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white">Admin Operator</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">operator@locator.pro</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <button 
                      onClick={() => { setIsProfileOpen(false); window.location.href = '/settings'; }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); alert("Mock logging out..."); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-650 hover:bg-red-500/5 transition-colors text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
