document.addEventListener('DOMContentLoaded', function() {
    const texts = [
        "Web Developer",
        "Virtual Assistant",
        "ESL Teacher",
        "Video & Graphics Editor"
    ];
    let currentIndex = 0;
    let currentText = '';
    let index = 0;
    let typing = true;
    const typingElement = document.getElementById('typing');

    function type() {
        if (index < currentText.length) {
            typingElement.innerHTML += currentText.charAt(index);
            index++;
            setTimeout(type, 100);
        } else {
            typing = false;
            setTimeout(deleteText, 2000);
        }
    }

    function deleteText() {
        if (index >= 0) {
            typingElement.innerHTML = currentText.substring(0, index);
            index--;
            setTimeout(deleteText, 50);
        } else {
            currentIndex = (currentIndex + 1) % texts.length;
            currentText = texts[currentIndex];
            typing = true;
            index = 0;
            setTimeout(type, 500);
        }
    }

    function startTypingEffect() {
        currentText = texts[currentIndex];
        type();
    }

    startTypingEffect();
});
