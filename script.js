const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    initialize(); // Recalcula as posições dos pontos após redimensionar
});

const DOT_RADIUS = 1.5;
let GLOBE_RADIUS;
let GLOBE_CENTER_X;
let GLOBE_CENTER_Y;
const NUM_DOTS = 1500;
let dots = [];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeedX = 0.0015;
let rotationSpeedY = 0.002;

class Dot {
    constructor(theta, phi) {
        this.theta = theta;
        this.phi = phi;
        this.updatePosition();
    }

    updatePosition() {
        const sinTheta = Math.sin(this.theta);
        const cosTheta = Math.cos(this.theta);
        const sinPhi = Math.sin(this.phi);
        const cosPhi = Math.cos(this.phi);

        this.x3D = GLOBE_RADIUS * sinTheta * cosPhi;
        this.y3D = GLOBE_RADIUS * sinTheta * sinPhi;
        this.z3D = GLOBE_RADIUS * cosTheta;

        // Projeção perspectiva
        const focalLength = 500;
        const scale = focalLength / (focalLength + this.z3D);
        this.x2D = GLOBE_CENTER_X + this.x3D * scale;
        this.y2D = GLOBE_CENTER_Y + this.y3D * scale;
    }

    draw() {
        // Calcula a distância radial normalizada (0 no centro, 1 na periferia)
        const radialDistance = Math.sqrt(this.x3D * this.x3D + this.y3D * this.y3D);
        const normalizedRadialDistance = radialDistance / GLOBE_RADIUS;

        // Mapeia a distância radial para uma cor no espectro eletromagnético
        const hue = normalizedRadialDistance * 270; // De vermelho (0°) a violeta (270°)
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

        ctx.beginPath();
        ctx.arc(this.x2D, this.y2D, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

    rotate(rotationX, rotationY) {
        // Rotação em torno do eixo Y (vertical)
        this.phi += rotationY;
        // Rotação em torno do eixo X (horizontal)
        this.theta += rotationX;
        this.updatePosition();
    }
}

let stars = [];

function generateStars() {
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random()
        });
    }
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function generateDots() {
    dots = [];
    for (let i = 0; i < NUM_DOTS; i++) {
        const theta = Math.acos(1 - 2 * Math.random()); // Distribuição uniforme na esfera
        const phi = Math.random() * Math.PI * 2;
        dots.push(new Dot(theta, phi));
    }
}

function initialize() {
    GLOBE_RADIUS = Math.min(canvas.width, canvas.height) * 0.35;
    GLOBE_CENTER_X = canvas.width / 2;
    GLOBE_CENTER_Y = canvas.height / 2;
    generateDots();
    generateStars();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    dots.forEach(dot => {
        dot.rotate(rotationSpeedX, rotationSpeedY);
        dot.draw();
    });

    requestAnimationFrame(animate);
}

initialize();
animate();

// Interatividade com Mouse ou Touch
canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
        let deltaX = e.clientX - previousMousePosition.x;
        let deltaY = e.clientY - previousMousePosition.y;

        let rotationY = deltaX * 0.005;
        let rotationX = deltaY * 0.005;

        dots.forEach(dot => {
            dot.rotate(rotationX, rotationY);
        });

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

canvas.addEventListener('mouseup', function(e) {
    isDragging = false;
});

canvas.addEventListener('mouseleave', function(e) {
    isDragging = false;
});

// Suporte para dispositivos móveis
canvas.addEventListener('touchstart', function(e) {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

canvas.addEventListener('touchmove', function(e) {
    if (isDragging) {
        let deltaX = e.touches[0].clientX - previousMousePosition.x;
        let deltaY = e.touches[0].clientY - previousMousePosition.y;

        let rotationY = deltaX * 0.005;
        let rotationX = deltaY * 0.005;

        dots.forEach(dot => {
            dot.rotate(rotationX, rotationY);
        });

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
});

canvas.addEventListener('touchend', function(e) {
    isDragging = false;
});

// Zoom com a roda do mouse
canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    GLOBE_RADIUS += e.deltaY * -0.02;
    GLOBE_RADIUS = Math.min(Math.max(50, GLOBE_RADIUS), canvas.width * 0.5);
    dots.forEach(dot => {
        dot.updatePosition();
    });
});

// Ajuste de tamanho dos pontos em dispositivos de alta densidade de pixels
if (window.devicePixelRatio > 1) {
    DOT_RADIUS *= window.devicePixelRatio;
}
