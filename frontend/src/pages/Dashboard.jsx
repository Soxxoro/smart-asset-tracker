import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, RefreshCw, AlertCircle, Box } from 'lucide-react';
import ItemGrid from '../components/ItemGrid';
import ItemModal from '../components/ItemModal';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchItems = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data } = await axios.get('/api/items');
            setItems(data);
            setError(null);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Failed to fetch items. Is the backend running?');
            console.error(err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Initial fetch and auto-refresh every 5 seconds
    useEffect(() => {
        fetchItems(true);
        const interval = setInterval(() => {
            fetchItems(false); // background refresh without loading spinner
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`/api/items/${id}`);
                setItems(items.filter(item => item._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete item');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.tagId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Summary Analytics
    const totalItems = items.length;
    const veryCloseItems = items.filter(i => i.status === 'Very Close').length;
    const nearbyItems = items.filter(i => i.status === 'Nearby').length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Assets</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalItems}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Very Close</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{veryCloseItems}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nearby</h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-2">{nearbyItems}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search items by name or tag..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <button 
                        onClick={() => fetchItems(true)} 
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add Asset</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {!loading && filteredItems.length === 0 && !error ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed">
                    <Box className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No assets found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new asset or connecting your ESP32.'}
                    </p>
                </div>
            ) : (
                <ItemGrid items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
            )}

            <ItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                item={editingItem}
                onSuccess={() => fetchItems(false)}
            />
        </div>
    );
};

export default Dashboard;
