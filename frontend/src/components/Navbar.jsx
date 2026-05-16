import { Menu, Sun, Moon, Bell } from 'lucide-react';

const Navbar = ({ toggleSidebar, darkMode, setDarkMode }) => {
    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-30">
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar} 
                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 ml-2 lg:ml-0">
                    Overview
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                </button>
                
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-sm ml-2 shadow-sm">
                    A
                </div>
            </div>
        </header>
    );
};

export default Navbar;
