document.addEventListener("DOMContentLoaded", function() {
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    const bookButtons = document.querySelectorAll('.book-btn');
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-btn');
    const bookingForm = document.getElementById('bookingForm');

    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });

    // Smooth scroll
    document.querySelectorAll('.navbar__links, .button').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hash !== "") {
                e.preventDefault();
                const hash = this.hash;
                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth'
                });
                // Close the mobile menu after clicking a link
                menu.classList.remove('is-active');
                menuLinks.classList.remove('active');
            }
        });
    });

    // Modal functionality
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

    // Slide show functionality
    let slideIndex = 0;
    showSlides();

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
        slides[slideIndex - 1].classList.add("active");
        if (dots.length > 0) {
            for (i = 0; i < dots.length; i++) {
                dots[i].classList.remove("active");
            }
            dots[slideIndex - 1].classList.add("active");
        }
        setTimeout(showSlides, 2000); // Change image every 2 seconds
    }

    // Handle form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            name: bookingForm.name.value,
            occasion: bookingForm.occasion.value,
            email: bookingForm.email.value,
            phone: bookingForm.phone.value,
            date: bookingForm.date.value,
        };

        fetch('http://localhost:8000/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.ok) {
                alert('Booking submitted successfully');
                modal.style.display = 'none';
                bookingForm.reset();
            } else {
                alert('Error submitting booking');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Error submitting booking');
        });
    });
});
