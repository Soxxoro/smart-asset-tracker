import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-200">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} darkMode={darkMode} setDarkMode={setDarkMode} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<div className="text-center mt-20 text-gray-500">Page not found</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
