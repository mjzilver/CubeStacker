import { CharParticle } from './particles/charParticle.js';

export class RenderingSystem {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    draw(particles) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // put a little red box in the centre
        this.ctx.fillStyle = 'red';
        for (let p of particles) {

            if (p instanceof CharParticle) {
                this.ctx.font = '16px Monospace';
                // this.ctx.fillStyle = 'grey';
                // this.ctx.fillRect(p.x, p.y, p.width, p.height);
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
        }
    }
}
