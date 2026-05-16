const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    tagId: {
        type: String,
        required: true,
        unique: true
    },
    rssi: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Very Close', 'Nearby', 'Far Away'],
        default: 'Far Away'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);