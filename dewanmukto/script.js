// Wait for the DOM to be fully loaded before executing JavaScript
document.addEventListener("DOMContentLoaded", function() {
    // Get the intro video element
    const introVideo = document.getElementById('introVideo');

    // Pause the video when it ends
    introVideo.addEventListener('ended', function() {
        fadeOutIntroVideo();
    });
});

// Function to fade out the intro video and remove it from the DOM
function fadeOutIntroVideo() {
    const introVideoOverlay = document.getElementById('introVideoOverlay');

    // Apply fade out animation
    introVideoOverlay.style.animation = 'fadeOut 1s forwards';

    // Remove the intro video overlay from the DOM after the animation ends
    introVideoOverlay.addEventListener('animationend', function() {
        introVideoOverlay.remove();
    });
}

function showCategory(category) {
        const content = document.getElementById('content');
        content.innerHTML = ''; // Clear existing content

        if (category === 'articles') {
            // If the category is "Articles", open an iframe
            const iframeUrl = 'https://dewanmukto.com/archive/'; // Replace with your actual URL
            const iframe = document.createElement('iframe');
            iframe.src = iframeUrl;
            iframe.className = 'articles-iframe';
            content.appendChild(iframe);
        } else {
        fetch(`${category}.txt`)
            .then(response => response.text())
            .then(data => {
                const items = data.split('\n').filter(line => line.trim() !== '');
                items.forEach((item, index) => {
                    const [name, description, imageUrl, iframeUrl] = item.split('///');
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item';
                    itemDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${name} image">
                        <h3>${name}</h3>
                        <p>${description}</p>
                    `;
                    if (category === 'designs') {
                        if (index === items.length + 1) { // Add buttons only after the last item
                            const behanceBtn = createButton('View more on Behance', 'fab fa-behance', 'https://www.behance.net/dmkto');
                            const dribbbleBtn = createButton('View more on Dribbble', 'fab fa-dribbble', 'https://dribbble.com/dewanmukto');
                            content.appendChild(behanceBtn);
                            content.appendChild(dribbbleBtn);
                        }
                    }
                    itemDiv.addEventListener('click', () => openPopup(iframeUrl));
                    content.appendChild(itemDiv);
                    setTimeout(() => itemDiv.classList.add('visible'), 100 * index); // Add staggered animation
                });
            })
            .catch(error => console.error('Error fetching the category file:', error));
        }
    }

    function openPopup(iframeUrl) {
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';

        const popupCloseBtn = document.createElement('button');
        popupCloseBtn.className = 'popup-close-btn';
        popupCloseBtn.innerHTML = '&times;';
        popupCloseBtn.addEventListener('click', () => {
            document.body.removeChild(popupContainer);
        });

        const iframe = document.createElement('iframe');
        iframe.src = iframeUrl;
        iframe.className = 'popup-iframe';

        popupContainer.appendChild(iframe);
        popupContainer.appendChild(popupCloseBtn);

        document.body.appendChild(popupContainer);
    }

    let currentIndex = 0;

    function scrollCategories(direction) {
        const categoriesList = document.getElementById('categoriesList');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const totalItems = categoryBtns.length;
        const itemsPerPage = window.innerWidth <= 768 ? 3 : 5; // Adjust based on your layout
        const maxIndex = Math.ceil(totalItems / itemsPerPage) - 1;

        currentIndex += direction;
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        const offset = -(currentIndex * 100) / itemsPerPage;
        if (window.innerWidth <= 768) {
            categoriesList.style.transform = `translateX(${offset}%)`;
        } else {
            categoriesList.style.transform = `translateY(${offset}%)`;
        }
    }
function toggleAboutPanel() {
    const aboutPanel = document.querySelector('.about-panel');
    if (!aboutPanel.classList.contains('expanded')) {
        aboutPanel.innerHTML = `
            Contact Me - Social Links
            <br><br>
            <a href="https://www.facebook.com/dewanmukto" target="_blank"><i class="fa-brands fa-facebook socials"></i></a>
            <a href="http://instagram.com/dewanmukto" target="_blank"><i class="fa-brands fa-instagram socials"></i></a>
             <a href="https://www.linkedin.com/in/dewanmukto/" target="_blank"><i class="fa-brands fa-linkedin socials"></i></a>
             <a href="https://www.youtube.com/@DewanMukto" target="_blank"><i class="fa-brands fa-youtube socials"></i></a>
             <a href="https://www.behance.net/dmkto" target="_blank"><i class="fa-brands fa-behance socials"></i></a>
             <a href="https://github.com/diztil" target="_blank"><i class="fa-brands fa-github socials"></i></a>
             <a href="https://x.com/dewan_mukto" target="_blank"><i class="fa-brands fa-twitter socials"></i></a>
             <a href="mailto:website@den.ovh" target="_blank"><i class="fa-solid fa-envelope socials"></i></a>
             <br><br>
             Tap/click again to close
        `;
        aboutPanel.classList.add('expanded');
    } else {
        aboutPanel.innerHTML = 'Contact Me';
        aboutPanel.classList.remove('expanded');
    }
}
