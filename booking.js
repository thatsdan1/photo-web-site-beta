const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

// Create a new booking
router.post('/booking', async (req, res) => {
    const { name, occasion, email, phone, date } = req.body;

    try {
        // Check if the date is already booked
        const existingBooking = await Booking.findOne({ date });
        if (existingBooking) {
            return res.status(400).json({ error: 'Date is already booked' });
        }

        // Create a new booking
        const newBooking = new Booking({ name, occasion, email, phone, date });
        await newBooking.save();

        res.status(200).json({ message: 'Booking created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
