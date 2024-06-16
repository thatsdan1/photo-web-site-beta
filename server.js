import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected successfully'))
    .catch((error) => console.error('Database connection error:', error));

// Define a Mongoose schema for bookings
const bookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    message: String
});

// Create a Mongoose model for bookings
const Booking = mongoose.model('Booking', bookingSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/booking', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ALERT_EMAIL,
            subject: 'New Booking',
            text: `You have a new booking from ${req.body.name} (${req.body.email}).`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send('Booking added successfully!');
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).send('Error submitting booking');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
