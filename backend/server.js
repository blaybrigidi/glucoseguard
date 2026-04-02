const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const connectDB = require('./config/db'); // Uncomment when DB is configured

// Load environment variables
dotenv.config();

// Firebase Admin initialization happens in config/firebase.js (imported when needed by services)
// or we can import it here to ensure it starts early:
require('./config/firebase');

const app = express();


// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Route Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/pdf', pdfRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('IoT Healthcare API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
