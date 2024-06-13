import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import path from 'path';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

// Setup Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Enable CORS if needed
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        logger.info('Database connected successfully.');
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    occasion: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    phone: { type: Number, required: true, min: 1000000000, max: 9999999999 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/api/getInfo', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        logger.error('Error getting info:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/booking', async (req, res) => {
    const { name, occasion, email, phone, date } = req.body;
    logger.info('Received booking request:', req.body);

    try {
        const existingBooking = await Booking.findOne({ email, date });
        if (existingBooking) {
            logger.error('Booking already exists for this email and date.');
            return res.status(400).send('Booking already exists for this email and date.');
        }

        const newBooking = new Booking({ name, occasion, email, phone, date });
        await newBooking.save();
        res.status(200).send('Booking added successfully!');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ALERT_EMAIL,
            subject: 'New Booking Submission',
            text: `New booking received:\n\nName: ${name}\nOccasion: ${occasion}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error('Error sending email:', error);
            } else {
                logger.info('Email sent: ' + info.response);
            }
        });

    } catch (err) {
        logger.error('Error submitting booking:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).send('Validation Error: ' + err.message);
        }
        res.status(500).send('Error: ' + err);
    }
});

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



