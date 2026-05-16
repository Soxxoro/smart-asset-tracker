import { useState } from 'react';
import { Menu, X, Box, Settings, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <>
            {/* Mobile overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            SmartAsset
                        </span>
                    </div>
                    <button onClick={toggleSidebar} className="ml-auto lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <Box className="h-5 w-5" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <Settings className="h-5 w-5" />
                        Settings
                    </NavLink>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
