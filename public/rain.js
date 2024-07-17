let particles = [];
let ctx;
let canvas;
// fps variables
let frameRate = 60;
let lastUpdateTime = 0;
let lastFpsUpdate = 0;
let updateInterval = 1000 / frameRate;
let frameCount = 0;
let fpsDisplay = document.getElementById('fpsDisplay');
// gravity variables
let gravityY = 0.45;
let gravityX = 0;
// how much the velocities slow down over time
let friction = 0.99;
// how much the particles bounce off each other
let collisionReaction = 0.8;

// Enum for mouse state
const MouseState = {
    GRAVITY: 'gravity',
    SOLID: 'solid',
    REPULSIVE: 'repulsive',
    INACTIVE: 'inactive'
};

let mouse = {
    x: 0,
    y: 0,
    radius: 50,
    state: MouseState.INACTIVE
};

import { Quadtree, Rectangle } from './quadtree.js';
import { Particle } from './particle.js';

let qT;

startFallingAnimation();

export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        startFallingAnimation(text);
    };
    reader.readAsText(file);
}

function startFallingAnimation(text = "Hello World!") {
    initCanvas();

    const lines = text.split('\n');
    const fontSize = 16;
    ctx.font = fontSize + 'px Monospace';
    ctx.fillStyle = 'white';

    particles = [];
    let y = fontSize;
    for (let line of lines) {
        let x = 0;
        for (let char of line) {
            if (char === ' ') {
                x += fontSize;
                continue;
            }

            let charWidth = ctx.measureText(char).width;
            let charHeight = fontSize;

            particles.push(
                new Particle(
                    char,
                    x,
                    y,
                    Math.random() * 5 + 1,
                    0,
                    charHeight,
                    charWidth
                ));
            x += charWidth;
        }
        y += fontSize;
    }

    qT.setMinSize(fontSize);

    requestAnimationFrame(animate);
}

function calculateFps(currentTime) {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsUpdate >= 1000) {
        const fps = frameCount * 1000 / (now - lastFpsUpdate);
        fpsDisplay.textContent = `FPS: ${Math.round(fps)}`;
        frameCount = 0;
        lastFpsUpdate = now;
    }
}

function animate(currentTime) {
    // Calculate elapsed time since last update
    const elapsedTime = currentTime - lastUpdateTime;

    // Only update if enough time has elapsed
    if (elapsedTime > updateInterval) {
        lastUpdateTime = currentTime - (elapsedTime % updateInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateParticles();

        drawMouse();
        drawParticles();
        calculateFps(currentTime);
    }

    // Request next frame
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / frameRate);
}

function updateParticles() {
    qT.clear();

    for (let p of particles) {
        qT.insert(p);
    }
    applySolidMouseForce();

    for (let p of particles) {
        let others = qT.query(new Rectangle(
            p.x,
            p.y,
            p.width,
            p.height
        ));

        applyFriction(p);
        applyGravity(p);
        applyMouseForce(p);
        handleEdgeCollisions(p);

        // check for collisions with other particles
        for (let o of others) {
            if (p !== o && p.checkCollisionAlongPath(o)) {
                resolveCollision(p, o);
                resolveCollision(o, p);
            }
        }
        // update position
        p.y += p.vy;
        p.x += p.vx;
    }
}

function drawParticles() {
    ctx.fillStyle = 'white';

    for (let p of particles) {
        ctx.fillText(p.char, p.x, p.y);
    }
}

function drawMouse() {
    switch (mouse.state) {
        case MouseState.GRAVITY:
            let gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
            gradient.addColorStop(0, 'grey');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case MouseState.SOLID:
            ctx.strokeStyle = 'white';
            ctx.strokeRect(
                mouse.x - mouse.radius / 2,
                mouse.y - mouse.radius / 2,
                mouse.radius,
                mouse.radius);
            break;
        case MouseState.REPULSIVE:
            break;
        case MouseState.INACTIVE:
            break;
    }
}

function resolveCollision(p, o) {
    const oCenterY = o.y + o.height / 2;
    if (p.y < oCenterY) {
        p.vy += collisionReaction + gravityY;
    } else {
        p.vy -= gravityY + collisionReaction;
    }

    const oCenterX = o.x + o.width / 2;
    if (p.x < oCenterX) {
        p.vx -= collisionReaction;
    } else if (p.x > oCenterX) {
        p.vx += collisionReaction;
    } else {
        p.vx += Math.random() > 0.5 ? collisionReaction : -collisionReaction;
    }
}

function applyFriction(p) {
    const velocityCap = 50;

    // slow down the particle
    p.vx *= friction;
    p.vy *= friction;

    // hard cap on the velocity
    if (p.vy > velocityCap) p.vy = velocityCap;
    if (p.vy < -velocityCap) p.vy = -velocityCap;
    if (p.vx > velocityCap) p.vx = velocityCap;
    if (p.vx < -velocityCap) p.vx = -velocityCap;
}

function applyGravity(p) {
    p.vy += gravityY;
    p.vx += gravityX;
}

function applySolidMouseForce() {
    if (mouse.state !== MouseState.SOLID) return;

    qT.insert(new Particle(
            ' ',
            mouse.x - mouse.radius / 2,
            mouse.y - mouse.radius / 2,
            0,
            0,
            mouse.radius,
            mouse.radius
        )
    );
    qT.visualize(ctx);
}

// mouse has its own gravitational field
function applyMouseForce(p) {
    if (mouse.state !== MouseState.GRAVITY) return;

    // the distance between the particle and the mouse
    let dx = mouse.x - p.x;
    let dy = mouse.y - p.y;

    // the angle between the particle and the mouse
    let angle = Math.atan2(dy, dx);

    // the distance between the particle and the mouse 
    let distance = Math.sqrt(dx * dx + dy * dy);

    // the force of the mouse on the particle
    let force = mouse.radius / distance;

    // the force on the x and y axis
    let fx = Math.cos(angle) * force;
    let fy = Math.sin(angle) * force;

    p.vx += fx;
    p.vy += fy;
}

function handleEdgeCollisions(p) {
    if (p.x <= 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx);
    } else if (p.x + p.width >= canvas.width) {
        p.x = canvas.width - p.width;
        p.vx = -Math.abs(p.vx);
    }

    if (p.y <= 0) {
        p.y = 0;
        p.vy = Math.abs(p.vy);
    } else if (p.y + (p.height / 2) >= canvas.height) {
        p.y = canvas.height - p.height / 2;
        p.vy = -Math.abs(p.vy / 2);
        // stops them from vibrating on the ground
        if (Math.abs(p.vy) < 0.5 + gravityY) {
            p.vy = 0;
        }
    }
}

function initCanvas() {
    if (!canvas) {
        canvas = document.getElementById('fallingCanvas');
        ctx = canvas.getContext('2d');
        addEventListeners(canvas)
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 25;

    qT = new Quadtree(0, 0, canvas.width, canvas.height);
    mouse.state = MouseState.INACTIVE;
}

function addEventListeners(canvas) {
    canvas.addEventListener('mouseup', (e) => {
        switch (mouse.state) {
            case MouseState.GRAVITY:
                mouse.state = MouseState.SOLID;
                break;
            case MouseState.SOLID:
                mouse.state = MouseState.REPULSIVE;
                break;
            case MouseState.REPULSIVE:
                mouse.state = MouseState.INACTIVE;
                break;
            case MouseState.INACTIVE:
                mouse.state = MouseState.GRAVITY;
                break;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp') {
            gravityY -= 0.05;
        } else if (e.key === 'ArrowDown') {
            gravityY += 0.05;
        } else if (e.key === 'ArrowLeft') {
            gravityX -= 0.05;
        } else if (e.key === 'ArrowRight') {
            gravityX += 0.05;
        }

        // typing letters just appears on the screen
        if (e.key.length === 1) {
            particles.push(new Particle(
                e.key,
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 5 + 1,
                0,
                16,
                16
            ));
        }

        // ctrl + r to reset
        if (e.ctrlKey && e.key === 'r') {
            particles = [];
        }
    });
}

window.addEventListener('resize', () => {
    if (particles.length > 0) {
        startFallingAnimation(document.getElementById('fileInput').value);
    }
});

// Make handleFileSelect globally accessible
window.handleFileSelect = handleFileSelect;