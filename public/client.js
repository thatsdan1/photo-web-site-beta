const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use the environment variable
        pass: process.env.EMAIL_PASS  // Use the environment variable
    }
});

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

        // Send email confirmation
        const mailOptions = {
            from: process.env.EMAIL_USER, // Using the environment variable
            to: email, // Send the email to the customer's email
            subject: 'Booking Confirmation',
            text: `Dear ${name},\n\nYour booking for ${occasion} on ${date} has been confirmed.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Booking created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
