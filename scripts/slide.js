document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.section');
    let screenPosition;

    // Adjust screenPosition based on device size
    if (window.innerWidth >= 768) {
        // Larger screens (desktops and tablets)
        screenPosition = window.innerHeight / 3;
    } else {
        // Smaller screens (mobile devices)
        screenPosition = window.innerHeight / 1; // Adjust as needed
    }

    sections.forEach(section => {
        const sectionPosition = section.getBoundingClientRect().top;
        const sectionBottom = section.getBoundingClientRect().bottom;

        if (sectionPosition < screenPosition && sectionBottom > 0) {
            // Section is sufficiently within the viewport
            const sectionTexts = section.querySelectorAll('.sectionText');
            sectionTexts.forEach(text => {
                text.classList.remove('initial-left'); // Ensure initial-left is removed
                text.classList.add('slide-in-right'); // Always slide in from right
            });

            // Show current section's cards
            const cards = section.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            // Section is outside the viewport or on small screens
            const sectionTexts = section.querySelectorAll('.sectionText');
            sectionTexts.forEach(text => {
                text.classList.remove('slide-in-right'); // Remove slide-in-right
                // You can optionally handle manual removal of 'initial-right' here if needed
            });

            // Hide all cards in this section
            const cards = section.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.display = 'none';
            });
        }
    });
});
