import { MoreVertical, Edit2, Trash2, MapPin, Signal } from 'lucide-react';
import { useState } from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        'Very Close': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        'Nearby': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        'Far Away': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    };

    const defaultStyle = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || defaultStyle}`}>
            {status || 'Unknown'}
        </span>
    );
};

const ItemGrid = ({ items, onEdit, onDelete }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    
                    {/* Decorative Top Bar based on status */}
                    <div className={`h-1 w-full absolute top-0 left-0 ${
                        item.status === 'Very Close' ? 'bg-green-500' :
                        item.status === 'Nearby' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                                    {item.itemName}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    ID: {item.tagId}
                                </p>
                            </div>
                            
                            <div className="relative dropdown-container">
                                <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} />
                            </div>
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-4 w-4" />
                                    <span>Status</span>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Signal className="h-4 w-4" />
                                    <span>Signal Strength</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {item.rssi} dBm
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Extracted ActionMenu to handle local state for dropdown
const ActionMenu = ({ item, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors focus:outline-none"
            >
                <MoreVertical className="h-5 w-5" />
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                        onClick={() => onEdit(item)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(item._id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemGrid;
