document.addEventListener("DOMContentLoaded", function() {
    const bookingForm = document.getElementById('bookingForm');

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            name: bookingForm.name.value,
            occasion: bookingForm.occasion.value,
            email: bookingForm.email.value,
            phone: bookingForm.phone.value,
            date: bookingForm.date.value,
        };

        fetch('/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.ok) {
                alert('Booking submitted successfully');
                bookingForm.reset();
            } else {
                response.text().then(text => {
                    alert('Error submitting booking: ' + text);
                });
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Error submitting booking: ' + error.message);
        });
    });

    // Check for duplicate dates
    const dateInput = bookingForm.querySelector('input[name="date"]');
    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;

        fetch(`/api/check-date?date=${selectedDate}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    alert('This date is already booked. Please choose another date.');
                    this.value = '';
                }
            });
    });
});





