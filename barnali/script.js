document.querySelectorAll('.accordion-btn').forEach(button => {
    button.addEventListener('click', () => {
        const accordionContent = button.nextElementSibling;

        // Toggle the accordion content
        const isVisible = accordionContent.style.display === 'block';
        accordionContent.style.display = isVisible ? 'none' : 'block';

        // Show/hide the last line based on the accordion content
        const lastLine = accordionContent.querySelector('.hidden-text');
        if (lastLine) {
            lastLine.style.display = isVisible ? 'none' : 'block';
        }
    });
});

// For modal functionality
const modal = document.getElementById("payment-modal");
const paymentInfo = document.getElementById("payment-info");

paymentInfo.addEventListener("click", () => {
    modal.style.display = "block";
});

const closeButton = document.querySelector(".close-button");
closeButton.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

const okayButton = document.querySelector(".okay-button");
okayButton.addEventListener("click", () => {
    modal.style.display = "none";
});

