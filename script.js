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
        ctx.beginPath();
        ctx.arc(this.x2D, this.y2D, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#000'; // Pontos pretos
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
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        dot.rotate(0.0015, 0.002); // Controla a velocidade de rotação
        dot.draw();
    });

    requestAnimationFrame(animate);
}

initialize();
animate();
