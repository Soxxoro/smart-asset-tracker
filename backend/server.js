const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

global.isMongoConnected = false;

if (process.env.MONGO_URI) {
    try {
        mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB Connected successfully!');
            global.isMongoConnected = true;
        })
        .catch(err => {
            console.log('MongoDB connection failed. Falling back to local JSON database.', err.message);
            global.isMongoConnected = false;
        });
    } catch (err) {
        console.log('MongoDB synchronous setup failed. Falling back to local JSON database.', err.message);
        global.isMongoConnected = false;
    }
} else {
    console.log('No MONGO_URI provided. Running on Fail-Safe Local JSON Database!');
    global.isMongoConnected = false;
}

const path = require('path');

app.use('/api/items', require('./routes/itemRoutes'));

// Serve Static Frontend files in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve the index.html for any frontend React routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});

module.exports = app;