let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
  setTimeout(showSlides, 2000); // Change image every 2 seconds
}
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


