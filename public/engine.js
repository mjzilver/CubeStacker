import { Quadtree } from './quadtree.js';
import { CubeParticle } from './particles/cubeParticle.js';
import { PhysicsSystem } from './physicsSystem.js';
import { RenderingSystem } from './renderingSystem.js';
import { EventSystem } from './eventSystem.js';

class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 25;
        this.particles = [];
        this.qT = new Quadtree(0, 0, this.canvas.width, this.canvas.height);
        this.physicsSystem = new PhysicsSystem();
        this.renderingSystem = new RenderingSystem(this.ctx, this.canvas);

        this.eventSystem = new EventSystem(this);

        for (let i = 0; i < 100; i++) {
            this.randomParticle(5, 15);
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    randomParticle(min, max) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.createParticle(x, y, min, max);
    }

    createParticle(x, y, min, max) {
        const size = Math.random() * (max - min) + min;
        const particle = new CubeParticle(x, y, 0, 0, size, size, 'white');
        this.particles.push(particle);
    }

    gameLoop() {
        this.physicsSystem.update(this.particles, this.qT, this.canvas.width, this.canvas.height);
        this.renderingSystem.draw(this.particles);
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Engine('canvas');
});
