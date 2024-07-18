let particles = [];
let ctx; 
let canvas;

let gravityY = 2;
let gravityX = 0;

import { Quadtree, Rectangle } from './quadtree.js';
import { Particle } from './particle.js';

let qT;

function setup() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 25;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mouseup', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        makeCube(x, y, 10, 55);
    });
    
    qT = new Quadtree(0, 0, canvas.width, canvas.height);
    qT.minSize = 5;

    for (let i = 0; i < 1000; i++) {
        randomCube(5, 15);
    }
}

start();

function randomCube( min, max) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    makeCube(x, y, min, max);
}

function makeCube(x, y, min, max) {
    // random between min and max
    const particleSize = Math.random() * (max - min) + min;

    particles.push(new Particle(
        '#', 
        x, 
        y, 
        0, 
        0, 
        particleSize, 
        particleSize));

}

function start() {
    setup();
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    qT.clear();

    for (let p of particles) {
        qT.insert(p);
    }

    for (let p of particles) {
        applyGravity(p);
        handleEdgeCollisions(p);
        
        const newRectangle = new Rectangle(
            p.x,
            p.y, 
            p.width, 
            p.height);

        const points = qT.query(newRectangle);


        for (let j = 0; j < points.length; j++) {
            const other = points[j];
            if (p !== other && p.checkCollisionAlongPath(other, 3)) {
                resolveCollision(p, other) 
                break;
            }
        }
        
        // Stop very small movements
        if (Math.abs(p.vx) < 0.15) p.vx = 0;
        if (Math.abs(p.vy) < 0.15) p.vy = 0;

        p.x += p.vx;
        p.y += p.vy;
        
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

function resolveCollision(p, o) {
    // if they are inside each other, move them apart
    if (p.intersects(o)) {
        if (p.x < o.x) {
            p.x -= 1;
            o.x += 1;
        } else {
            p.x += 1;
            o.x -= 1;
        }

        if (p.y < o.y) {
            p.y -= 1;
            o.y += 1;
        } else {
            p.y += 1;
            o.y -= 1;
        }
    }

    // find the direction of the collision
    const dx = (p.x + p.width / 2) - (o.x + o.width / 2);
    const dy = (p.y + p.height / 2) - (o.y + o.height / 2);

    // find the angle of the collision
    const angle = Math.atan2(dy, dx);

    const magnitudeScalingFactor = 25;
    // calculate the magnitude of the velocity
    const magnitudeP = Math.sqrt(p.vx * p.vx + p.vy * p.vy) / magnitudeScalingFactor;
    // calculate the magnitude of the velocity
    const magnitudeO = Math.sqrt(o.vx * o.vx + o.vy * o.vy) / magnitudeScalingFactor;

    p.vy = magnitudeP * Math.sin(angle);
    p.vx = magnitudeP * Math.cos(angle);

    o.vy = magnitudeO * Math.sin(angle);
    o.vx = magnitudeO * Math.cos(angle);
}


function applyFriction(sandParticle) {
    sandParticle.vx *= 0.9;
    sandParticle.vy *= 0.9;
}

function applyGravity(sandParticle) {
    sandParticle.vy += gravityY;
    sandParticle.vx += gravityX;
}

function handleEdgeCollisions(sandParticle) {
    if (sandParticle.x < 0) {
        sandParticle.vx = 0;
    } else if (sandParticle.x + sandParticle.width > canvas.width) {
        sandParticle.vx = 0;
    }

    if (sandParticle.y < 0 ) {
        sandParticle.vy = 0;
    } else if (sandParticle.y + sandParticle.height > canvas.height) {
        sandParticle.vy = 0;
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
        const sandSize = p.width;
        // draw a border around the sand
        ctx.fillStyle = 'red';
        ctx.fillRect(p.x - 1, p.y -1, sandSize, sandSize);

        ctx.fillStyle = 'blue';
        ctx.fillRect(p.x, p.y, sandSize + 1, sandSize +1);

        ctx.fillStyle = 'white';
        ctx.fillRect(p.x, p.y, sandSize, sandSize);
    }
}
