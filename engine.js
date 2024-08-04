import { Quadtree } from './quadtree.js';
import { CubeParticle } from './particles/cubeParticle.js';
import { PhysicsSystem } from './physicsSystem.js';
import { RenderingSystem } from './renderingSystem.js';
import { EventSystem } from './eventSystem.js';

Math.randomRange = function (min, max) {
    return Math.random() * (max - min) + min;
};

class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        this.paused = false;

        const quadTreeMargin = 5;
        this.quadtree = new Quadtree(
            -quadTreeMargin, 
            -quadTreeMargin , 
            this.canvas.width + quadTreeMargin, 
            this.canvas.height + quadTreeMargin);
        this.physicsSystem = new PhysicsSystem();
        this.renderingSystem = new RenderingSystem(this.ctx, this.canvas);
        this.eventSystem = new EventSystem(this);

        for (let i = 0; i < 200; i++) {
            this.randomParticle(15, 25);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    randomParticle(minSize, maxSize) {
        const x = Math.randomRange(0, this.canvas.width - maxSize);
        const y = Math.randomRange(maxSize, this.canvas.height - maxSize);
        this.createParticle(x, y, minSize, maxSize);
    }

    createParticle(x, y, minSize, maxSize) {
        const size = Math.randomRange(minSize, maxSize);
        const particle = new CubeParticle(x, y, 0, 0, size, size, 'white');
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        particle.color = '#' + randomColor
        this.particles.push(particle);
        this.quadtree.insert(particle);
    }

    gameLoop() {
        if (!this.paused) {
            this.physicsSystem.update(this.particles, this.quadtree, this.canvas.width, this.canvas.height);
        }
        this.renderingSystem.draw(this);
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Engine('canvas');
});
