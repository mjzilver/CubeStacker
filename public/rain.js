let particles = [];
let ctx;
let canvas;
// fps variables
let frameRate = 30;
let lastUpdateTime = 0;
let updateInterval = 1000 / frameRate;
let frameCount = 0;
let fpsDisplay = document.getElementById('fpsDisplay'); 
// gravity variables
let gravityY = 0.4;
let gravityX = 0;
// how much the velocities slow down over time
let friction = 0.99;
// how much the particles bounce off each other
let collisionReaction = 0.5;

import { Quadtree, Rectangle} from './quadtree.js';
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

    requestAnimationFrame(animate);
}

function animate(currentTime) {
    // Calculate elapsed time since last update
    const elapsedTime = currentTime - lastUpdateTime;

    // Only update if enough time has elapsed
    if (elapsedTime > updateInterval) {
        lastUpdateTime = currentTime - (elapsedTime % updateInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateParticles();
        drawParticles();

        // Calculate FPS
        const fps = Math.round(1000 / elapsedTime);
        frameCount++;
        fpsDisplay.textContent = `FPS: ${fps}`;
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

        let others = qT.query(new Rectangle(
            p.x,
            p.y,
            p.width,
            p.height
        ));

        applyFriction(p);
        applyGravity(p);
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
    for (let p of particles) {
        ctx.fillText(p.char, p.x, p.y);
    }
}

function resolveCollision(p, o) {
    if (p.y < o.y) {
        p.vy += collisionReaction + gravityY;
    } else {
        p.vy -= gravityY + collisionReaction;
    }

    if (p.x < o.x) {
        p.vx -= collisionReaction;
    } else if (p.x > o.x) {
        p.vx += collisionReaction;
    } else {
        p.vx += Math.random() > 0.5 ? collisionReaction : -collisionReaction;
    }
}

function applyFriction(p) {
    p.vx *= friction;
    p.vy *= friction;
}

function applyGravity(p) {
    p.vy += gravityY;
    p.vx += gravityX;
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
        if (Math.abs(p.vy) < 0.1 + gravityY) {
            p.vy = 0;
        }
    }
}

function initCanvas() {
    if (!canvas) {
        canvas = document.getElementById('fallingCanvas');
        ctx = canvas.getContext('2d');
    }
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 25;

    qT = new Quadtree(0, 0, canvas.width, canvas.height);
    
    canvas.addEventListener('click', (e) => {
        console.log(`mouse x: ${e.clientX}, y: ${e.clientY}`);
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
    });
}

window.addEventListener('resize', () => {
    if (particles.length > 0) {
        startFallingAnimation(document.getElementById('fileInput').value);
    }
});

// Make handleFileSelect globally accessible
window.handleFileSelect = handleFileSelect;