import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Radar, 
  PlusCircle, 
  History, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Tracking', path: '/live', icon: Radar },
    { name: 'Add New Asset', path: '/add', icon: PlusCircle },
    { name: 'Asset History', path: '/history', icon: History },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: 3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: '260px' },
    collapsed: { width: '80px' },
  };

  const linkTextVariants = {
    expanded: { opacity: 1, x: 0, display: 'block' },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } },
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 shadow-xl lg:shadow-none transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-hidden`}
      >
        {/* Header Block */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-850 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 truncate"
              >
                Locator Pro
              </motion.span>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/5 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-500/5 border border-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left Highlight Bar on active */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-indigo-600 dark:bg-indigo-455"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <item.icon className={`h-5 w-5 shrink-0 ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors'
                  }`} />

                  <motion.span
                    variants={linkTextVariants}
                    className="text-[14px] truncate"
                  >
                    {item.name}
                  </motion.span>

                  {/* Badges count */}
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white shadow-sm shadow-indigo-500/10 shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed view hovering tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all z-[9999] pointer-events-none shadow-md">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Collapse Controller Foot */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 hidden lg:block shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-xl transition-all"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-indigo-500" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-semibold">Collapse panel</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
