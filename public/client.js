document.addEventListener("DOMContentLoaded", function() {
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    const galleryItems = document.querySelectorAll('.gallery__item');

    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });

    // Smooth scroll for internal links
    document.querySelectorAll('.navbar__links, .button').forEach(link => {
        if (link.hash) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const hash = this.hash;
                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth'
                });
                // Close the mobile menu after clicking a link
                menu.classList.remove('is-active');
                menuLinks.classList.remove('active');
            });
        }
    });

    // Hover animation for gallery items
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
});