function showCarouselItem(index) {
    var carousel = document.getElementById('carouselExample');
    var currentSlide = carousel.querySelector('.carousel-item.active');
    var currentIndex = Array.from(carousel.querySelectorAll('.carousel-item')).indexOf(currentSlide);

    // Only slide if not already on the selected item
    if (currentIndex !== index) {
        var carouselInstance = new bootstrap.Carousel(carousel);
        carouselInstance.to(index);
    }
    
    // Smooth scroll to carousel
    var carouselOffsetTop = carousel.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: carouselOffsetTop, behavior: 'smooth' });
}