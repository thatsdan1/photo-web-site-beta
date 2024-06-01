import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

console.log('MONGO_URL:', MONGO_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('ALERT_EMAIL:', process.env.ALERT_EMAIL);

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
        console.log('Database is connected successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    });

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    occasion: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    phone: { type: Number, required: true, min: 1000000000, max: 9999999999 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/getInfo', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        console.error('Error getting info:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/booking', async (req, res) => {
    const { name, occasion, email, phone, date } = req.body;
    console.log('Received booking request:', req.body);

    try {
        // Check for existing booking with the same email and date
        const existingBooking = await Booking.findOne({ email, date });
        if (existingBooking) {
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
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (err) {
        console.error('Error submitting booking:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).send('Validation Error: ' + err.message);
        }
        res.status(500).send('Error: ' + err);
    }
});


