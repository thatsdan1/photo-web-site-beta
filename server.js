import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';

// Load environment variables from .env file
dotenv.config();

// Debugging: Print environment variables to check if they are loaded correctly
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);

// Initialize Express
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());  // To parse JSON data from client
app.use(cors());  // To handle CORS issues

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME  // Use the DB_NAME variable
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 465 for secure connections (SSL)
    secure: true, // true for port 465, false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/booking', (req, res) => {
    const { name, email, phone, date, message } = req.body;

    // Validate that all required fields are present
    if (!name || !email || !date || !message) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    console.log('Received booking:', { name, email, phone, date, message });

    // Insert booking into MySQL
    const query = `INSERT INTO bookings (customer_name, customer_email, appointment_date, appointment_time, message) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [name, email, date, '14:00:00', message], (err, result) => {
        if (err) {
            console.error('Error inserting booking:', err);
            return res.status(500).json({ error: 'Error saving booking.' });
        }

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,  // Use the customer's email from the request
            subject: 'Booking Confirmation',
            text: `Dear ${name},\n\nYour booking for ${message} on ${date} has been confirmed.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ error: 'Error sending email.' });
            }

            res.status(200).json({ message: 'Booking added and email sent successfully!' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
