const fs = require('fs');
const path = require('path');
const Item = require('../models/Item');

const jsonFilePath = path.join(__dirname, '../items.json');

// Helper to determine status from RSSI
const getStatusFromRssi = (rssi) => {
    if (rssi > -45) return 'Very Close';
    if (rssi > -60) return 'Nearby';
    return 'Far Away';
};

// Helper to read JSON
const readLocalDb = () => {
    try {
        if (!fs.existsSync(jsonFilePath)) {
            // Seed it with some initial premium template items so the dashboard looks beautiful
            const initialItems = [
                { _id: 'local_1', itemName: 'Living Room TV Remote', tagId: 'TAG-82947', rssi: -40, status: 'Very Close', updatedAt: new Date().toISOString() },
                { _id: 'local_2', itemName: 'Master Bedroom Keys', tagId: 'TAG-19284', rssi: -55, status: 'Nearby', updatedAt: new Date().toISOString() },
                { _id: 'local_3', itemName: 'Office Wallet Tracker', tagId: 'TAG-74928', rssi: -88, status: 'Far Away', updatedAt: new Date().toISOString() }
            ];
            fs.writeFileSync(jsonFilePath, JSON.stringify(initialItems, null, 2));
            return initialItems;
        }
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write JSON
const writeLocalDb = (data) => {
    try {
        fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing to JSON DB', err);
    }
};

// @desc    Get all items
// @route   GET /api/items
exports.getItems = async (req, res) => {
    try {
        if (!global.isMongoConnected) {
            const items = readLocalDb();
            // Sort by updatedAt descending
            items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return res.status(200).json(items);
        }
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

        if (!global.isMongoConnected) {
            const items = readLocalDb();
            let item = items.find(i => i.tagId === tagId);

            if (item) {
                // Update existing item
                item.rssi = rssi;
                item.status = status;
                if (itemName) item.itemName = itemName;
                item.updatedAt = new Date().toISOString();
                writeLocalDb(items);
                return res.status(200).json(item);
            } else {
                // Create new item
                item = {
                    _id: 'local_' + Math.random().toString(36).substr(2, 9),
                    itemName: itemName || `Unknown Item (${tagId})`,
                    tagId,
                    rssi,
                    status,
                    updatedAt: new Date().toISOString()
                };
                items.push(item);
                writeLocalDb(items);
                return res.status(201).json(item);
            }
        }

        let item = await Item.findOne({ tagId });

        if (item) {
            // Update existing item
            item.rssi = rssi;
            item.status = status;
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
        
        if (!global.isMongoConnected) {
            const items = readLocalDb();
            const item = items.find(i => i._id === req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (itemName) item.itemName = itemName;
            if (tagId) item.tagId = tagId;
            if (rssi !== undefined) {
                item.rssi = rssi;
                item.status = getStatusFromRssi(rssi);
            }
            item.updatedAt = new Date().toISOString();
            writeLocalDb(items);
            return res.status(200).json(item);
        }

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
        if (!global.isMongoConnected) {
            let items = readLocalDb();
            const itemIndex = items.findIndex(i => i._id === req.params.id);
            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Item not found' });
            }
            items.splice(itemIndex, 1);
            writeLocalDb(items);
            return res.status(200).json({ message: 'Item deleted successfully' });
        }

        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
