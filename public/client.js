document.addEventListener("DOMContentLoaded", function() {
    // Mobile menu toggle
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });

    // Smooth scrolling
    document.querySelectorAll('.navbar__links, .button').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hash !== "") {
                e.preventDefault();
                const hash = this.hash;
                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth'
                });
                menu.classList.remove('is-active');
                menuLinks.classList.remove('active');
            }
        });
    });

    // Modal functionality
    const bookButtons = document.querySelectorAll('.book-btn');
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    });
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Slideshow functionality
    let slideIndex = 0;
    function showSlides() {
        let i;
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1 }
        slides[slideIndex - 1].style.display = "block";
        if (dots.length > 0) {
            for (i = 0; i < dots.length; i++) {
                dots[i].classList.remove("active");
            }
            dots[slideIndex - 1].classList.add("active");
        }
        setTimeout(showSlides, 2000); // Change image every 2 seconds
    }
    showSlides();

    // Form submission
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
        })
        .then(response => {
            if (response.ok) {
                alert('Booking submitted successfully');
                bookingForm.reset();
            } else {
                response.text().then(text => {
                    alert('Error submitting booking: ' + text);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting booking: ' + error.message);
        });
    });
});
