document.addEventListener('DOMContentLoaded', function () {
    const bookingForm = document.getElementById('bookingForm');

    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(bookingForm);
        const data = {
            name: formData.get('name'),
            occasion: formData.get('occasion'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('date')
        };

        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.text();
            if (response.ok) {
                alert('Booking added successfully!');
            } else {
                alert('Error submitting booking: ' + result);
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Error submitting booking: ' + error.message);
        }
    });
});


