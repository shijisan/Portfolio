const modalLinks = document.querySelectorAll('#contactModal a');
modalLinks.forEach(link => {
    link.addEventListener('click', () => {
        const modal = document.querySelector('#contactModal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
    });
});