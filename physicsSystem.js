import { Rectangle } from './quadtree.js';

export class PhysicsSystem {
    constructor(gravityX = 0, gravityY = 1.5) {
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.frictionX = 0.9;
        this.frictionY = 0.9;
        this.maxVelocity = 100;
    }

    applyFriction(particle) {
        particle.vx *= this.frictionX;
        particle.vy *= this.frictionY;
    }

    applyGravity(particle) {
        particle.vy += this.gravityY;
        particle.vx += this.gravityX;
    }

    resolveCollision(p, o) {
        const dx = (p.x + p.width / 2) - (o.x + o.width / 2);
        const dy = (p.y + p.height / 2) - (o.y + o.height / 2);
        const angle = Math.atan2(dy, dx);

        let magnitudeScalingFactor = 5;
        if (p.checkCollision(o)) {
            p.secondColor = 'red';
            magnitudeScalingFactor = 1;
        } else {
            p.secondColor = 'blue';
        }

        const magnitudeP = Math.sqrt(p.vx * p.vx + p.vy * p.vy) / magnitudeScalingFactor;
        const magnitudeO = Math.sqrt(o.vx * o.vx + o.vy * o.vy) / magnitudeScalingFactor;

        p.vy = magnitudeP * Math.sin(angle);
        p.vx = magnitudeP * Math.cos(angle);

        o.vy = magnitudeO * Math.sin(angle);
        o.vx = magnitudeO * Math.cos(angle);
    }

    update(particles, quadtree, canvasWidth, canvasHeight) {
        quadtree.clear();

        for (let p of particles) {
            quadtree.insert(p);
        }

        for (let p of particles) {
            let old = { x: p.x, y: p.y };

            this.applyGravity(p);
            this.applyFriction(p);

            const pathRectangle = new Rectangle(
                Math.min(p.x, p.x + p.vx),
                Math.min(p.y, p.y + p.vy),
                p.width + Math.abs(p.vx),
                p.height + Math.abs(p.vy)
            );
            const others = quadtree.query(pathRectangle);

            for (let other of others) {
                if (p !== other && p.checkCollisionAlongPath(other, 3)) {
                    this.resolveCollision(p, other);
                    other.vx += p.vx ;
                    other.vy += p.vy;
                    break;
                } else {
                    p.secondColor = 'green';
                }
            }

            if (Math.abs(p.vx) < 0.3) p.vx = 0;
            if (Math.abs(p.vy) < 0.3) p.vy = 0;

            if (!p.frozen) {
                p.x += p.vx;
                p.y += p.vy;
            }

            if (p.y < 0 || p.y + p.height > canvasHeight) {
                p.y = old.y;
            } else if (p.x < 0 || p.x + p.width > canvasWidth) {
                p.x = old.x;
            }
        }
    }
}
