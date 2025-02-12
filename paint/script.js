let canvas = document.getElementById('paintCanvas');
let ctx = canvas.getContext('2d');
let painting = false;
let brushSize = 5;
let brushColor = '#000000';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

let eraserMode = false;

document.getElementById('eraserTool').addEventListener('click', () => {
    eraserMode = !eraserMode;
    if (eraserMode) {
        document.getElementById('eraserTool').style.backgroundColor = '#ffcc00';
    } else {
        document.getElementById('eraserTool').style.backgroundColor = '';
    }
});

let history = [];
let historyIndex = -1;

// Function to save the current state of the canvas to history
function saveHistory() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toDataURL());
    historyIndex++;
}

document.getElementById('undoButton').addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        let undoState = new Image();
        undoState.src = history[historyIndex];
        undoState.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(undoState, 0, 0);
        };
    }
});

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);

    if (eraserMode) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000000';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
    }

    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    createParticles(x, y);

    if (!eraserMode) {
        saveHistory();
    }
}

function createParticles(x, y) {
    let particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    let size = Math.random() * 5 + 2;
    particle.style.left = `${x - 2}px`;
    particle.style.top = `${y - 2}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    setTimeout(() => particle.remove(), 500);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history = [];
    historyIndex = -1;
});

document.getElementById('brush-size-container').addEventListener('click', () => {
    const sliderContainer = document.getElementById('brush-slider-container');
    sliderContainer.style.display = sliderContainer.style.display === 'block' ? 'none' : 'block';
});

function changeBrushSize(value) {
    brushSize = value;
    document.getElementById('brush-size-preview').textContent = `${value}px`;
}

function updateColorPickerBackground() {
    const colorPickerButton = document.getElementById('color-picker-button');
    colorPickerButton.style.backgroundColor = brushColor;
}

document.getElementById('color-picker-button').addEventListener('click', () => {
    let colorPicker = document.createElement('input');
    colorPicker.setAttribute('type', 'color');
    colorPicker.style.position = 'absolute';
    colorPicker.style.zIndex = '1000';
    colorPicker.addEventListener('input', (e) => {
        brushColor = e.target.value;
        updateColorPickerBackground();
        document.body.removeChild(colorPicker);
    });
    document.body.appendChild(colorPicker);
    colorPicker.click();
});

document.getElementById('brush-size-container').addEventListener('mouseover', () => {
    document.getElementById('brush-size-container').style.backgroundColor = brushColor;
});

document.getElementById('brush-size-container').addEventListener('mouseout', () => {
    document.getElementById('brush-size-container').style.backgroundColor = '#f3f3f3';
});
