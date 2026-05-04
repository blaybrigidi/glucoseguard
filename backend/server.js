// Entry point for the backend — sets up Express, connects Firebase,
// registers all API routes, and starts listening for requests.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Boot Firebase early so it's ready before any request comes in
require('./config/firebase');

const app = express();

// Only allow requests from known frontend origins (configured in .env for production)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
    res.send('IoT Healthcare API is running...');
});

// Central error handler — any route can call next(error) and it lands here.
// We hide the stack trace in production so we don't leak internals.
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
