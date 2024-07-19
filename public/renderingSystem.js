import { CharParticle } from './particles/charParticle.js';
import { CubeParticle } from './particles/cubeParticle.js';

export class RenderingSystem {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.debug = false;
        this.threeD = true;
    }

    draw(engine) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);



        for (let p of engine.particles) {
            if (p instanceof CubeParticle) {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(p.x - 1, p.y - 1, p.width, p.height);

                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(p.x, p.y, p.width + 1, p.height + 1);

                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(p.x + 1, p.y + 1, p.width - 2, p.height - 2);
            } else if (p instanceof CharParticle) {
                this.ctx.font = '16px Monospace';
                if (this.debug) {
                    this.ctx.fillStyle = 'grey';
                    this.ctx.fillRect(p.x, p.y, p.width, p.height);
                }
                this.ctx.fillStyle = 'white';

                // center the char
                this.ctx.fillText(p.char, p.x + p.width / 4, p.y + p.height * 3 / 4);
            }
        }

        if (this.debug)
            this.debugDraw(engine);
    }

    draw3d(engine) {

        // Sort particles by their depth (y position) for proper layering
        var sortedParticles = engine.particles.filter(p => p instanceof CubeParticle).sort((a, b) => b.y - a.y);

        for (let p of sortedParticles) {
            const topDepth = p.width / 5;

            // Draw faces in the correct order: top, right, then front

            // top face
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.width, p.y);
            this.ctx.lineTo(p.x + p.width + topDepth, p.y - topDepth);
            this.ctx.lineTo(p.x + topDepth, p.y - topDepth);
            this.ctx.closePath();
            this.ctx.fill();

            // right face
            this.ctx.fillStyle = 'blue';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + p.width, p.y);
            this.ctx.lineTo(p.x + p.width, p.y + p.height);
            this.ctx.lineTo(p.x + p.width + topDepth, p.y + p.height - topDepth);
            this.ctx.lineTo(p.x + p.width + topDepth, p.y - topDepth);
            this.ctx.closePath();
            this.ctx.fill();

            // front face
            this.ctx.fillStyle = 'grey';
            this.ctx.fillRect(
                p.x,
                p.y,
                p.width,
                p.height
            );

            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x, p.y + p.height);
            this.ctx.lineTo(p.x + p.width, p.y + p.height);
            this.ctx.lineTo(p.x + p.width, p.y);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    debugDraw(engine) {
        engine.quadtree.visualize(this.ctx);

        for (let p in this.particles) {
            if (this.debug) {
                this.ctx.strokeStyle = 'red';
                this.ctx.beginPath();
                const pCenterX = p.x + p.width / 2;
                const pCenterY = p.y + p.height / 2;
                this.ctx.moveTo(pCenterX, pCenterY);
                this.ctx.lineTo(pCenterX + p.vx, pCenterY + p.vy);
                this.ctx.stroke();
            }
        }
    }
}
