document.addEventListener("DOMContentLoaded", function() {
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date: document.getElementById('date').value,
            message: document.getElementById('message').value
        };

        // Log data before sending (for debugging)
        console.log("Form Data being sent: ", formData);

        // Send the form data as JSON
        fetch('http://localhost:8080/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Server Response: ", data);
            alert('Booking added and email sent successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error with your booking.');
        });
    });
});
