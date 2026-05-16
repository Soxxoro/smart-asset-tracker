import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

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
                rssi: -100
            });
        }
        setError('');
    }, [item, isOpen]);

    if (!isOpen) return null;

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
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Modal */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {item ? 'Edit Asset' : 'Add New Asset'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Asset Name
                        </label>
                        <input
                            type="text"
                            name="itemName"
                            required
                            value={formData.itemName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Living Room TV"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            RFID Tag ID
                        </label>
                        <input
                            type="text"
                            name="tagId"
                            required
                            disabled={!!item}
                            value={formData.tagId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="e.g. TAG-12345"
                        />
                        {item && <p className="text-xs text-gray-500 mt-1">Tag ID cannot be changed after creation.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Simulate RSSI (dBm)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                name="rssi"
                                min="-100"
                                max="-30"
                                value={formData.rssi}
                                onChange={handleChange}
                                className="flex-1 accent-blue-600"
                            />
                            <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-16 text-center">
                                {formData.rssi}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                            <span>Far (-100)</span>
                            <span>Close (-30)</span>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {item ? 'Save Changes' : 'Create Asset'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;
