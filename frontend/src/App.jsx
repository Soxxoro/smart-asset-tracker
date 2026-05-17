import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import AddAsset from './pages/AddAsset';
import AssetHistory from './pages/AssetHistory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { ToastContainer } from './components/Toast';

// Component wrapper to enable Framer Motion location keys
const AnimatedRoutes = ({ darkMode, setDarkMode, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live" element={<LiveTracking />} />
        <Route path="/add" element={<AddAsset />} />
        <Route path="/history" element={<AssetHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">404</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Page not found</p>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Initialize dark mode from system preference or localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

        {/* Sidebar Container */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleMobileSidebar={toggleMobileSidebar}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AnimatedRoutes
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
              />
            </div>
          </main>
        </div>

        {/* Global Floating Toasts */}
        <ToastContainer toasts={toasts} setToasts={setToasts} />
      </div>
    </Router>
  );
}

export default App;
