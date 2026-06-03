const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes Imports
const paymentRoutes = require('./routes/paymentRoutes.js');
const movieRoutes = require('./routes/movieRoutes.js');
const showRoutes = require('./routes/showRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');
const theaterRoutes = require('./routes/theaterRoutes.js');



const app = express(); 

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoints Mount
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);
app.use("/api/payment", paymentRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Systematic PERN server running cleanly on port ${PORT}`);
});
