import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import serverless from 'serverless-http';
import morgan from 'morgan';

const app = express();
const router = express.Router();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/photography';

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected successfully'))
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    });

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    occasion: { type: String, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    phone: { type: Number, required: true, min: 1000000000, max: 9999999999 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.use(morgan('dev')); // Adding Morgan for logging HTTP requests
app.use(bodyParser.json()); // Middleware for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // Middleware for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post('/booking', async (req, res) => {
    const { name, occasion, email, phone, date } = req.body;
    console.log('Received booking request:', req.body);

    try {
        const existingBooking = await Booking.findOne({ email, date });
        if (existingBooking) {
            console.error('Booking already exists for this email and date.');
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
        console.error(err); // Log the entire error object
        res.status(500).send('Error: ' + err.message);
    }
});

app.use('/api', router);

export default app;
export const handler = serverless(app);
