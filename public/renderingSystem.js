import { CharParticle } from './particles/charParticle.js';

export class RenderingSystem {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.debug = true;
    }

    draw(engine) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        engine.quadtree.visualize(this.ctx);

        for (let p of engine.particles) {
            if (p instanceof CharParticle) {
                this.ctx.font = '16px Monospace';
                if (this.debug) {
                    this.ctx.fillStyle = 'grey';
                    this.ctx.fillRect(p.x, p.y, p.width, p.height);
                }
                this.ctx.fillStyle = 'white';

                // center the char
                this.ctx.fillText(p.char, 
                    p.x + p.width / 4, 
                    p.y + p.height * 3/4);
            } else {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(p.x - 1, p.y - 1, p.width, p.height);

                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(p.x, p.y, p.width + 1, p.height + 1);

                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(p.x, p.y, p.width, p.height);
            }

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
