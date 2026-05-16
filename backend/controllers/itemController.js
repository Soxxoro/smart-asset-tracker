const Item = require('../models/Item');

// Helper to determine status from RSSI
const getStatusFromRssi = (rssi) => {
    if (rssi > -45) return 'Very Close';
    if (rssi > -60) return 'Nearby';
    return 'Far Away';
};

// @desc    Get all items
// @route   GET /api/items
exports.getItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ updatedAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create or Update item (Used by ESP32)
// @route   POST /api/items
exports.createOrUpdateItem = async (req, res) => {
    try {
        const { itemName, tagId, rssi } = req.body;

        if (!tagId) {
            return res.status(400).json({ message: 'tagId is required' });
        }

        const status = getStatusFromRssi(rssi);

        let item = await Item.findOne({ tagId });

        if (item) {
            // Update existing item
            item.rssi = rssi;
            item.status = status;
            // Optionally update name if provided and we want ESP32 to override it
            if (itemName) item.itemName = itemName;
            await item.save();
            return res.status(200).json(item);
        } else {
            // Create new item
            item = new Item({
                itemName: itemName || `Unknown Item (${tagId})`,
                tagId,
                rssi,
                status
            });
            await item.save();
            return res.status(201).json(item);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update item details manually (Used by Frontend)
// @route   PUT /api/items/:id
exports.updateItem = async (req, res) => {
    try {
        const { itemName, tagId, rssi } = req.body;
        
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (itemName) item.itemName = itemName;
        if (tagId) item.tagId = tagId;
        if (rssi !== undefined) {
            item.rssi = rssi;
            item.status = getStatusFromRssi(rssi);
        }

        await item.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
