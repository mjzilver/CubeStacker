import { Rectangle } from './quadtree.js';

export class PhysicsSystem {
    constructor(gravityX = 0, gravityY = 1) {
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.frictionX = 0.9;
        this.frictionY = 0.9;
    }

    applyFriction(particle) {
        particle.vx *= this.frictionX;
        particle.vy *= this.frictionY;
    }

    applyGravity(particle) {
        if (!particle.onGround) {
            particle.vy += this.gravityY;
        }
        particle.vx += this.gravityX;
    }

    handleEdgeCollisions(particle, canvasWidth, canvasHeight) {
        if (particle.x < 0) {
            particle.x = 0;
            particle.vx = 0;
        } else if (particle.x + particle.width > canvasWidth) {
            particle.x = canvasWidth - particle.width;
            particle.vx = 0;
        }

        if (particle.y < 0) {
            particle.y = 0;
            particle.vy = 0;
        } else if (particle.y + particle.height > canvasHeight) {
            particle.y = canvasHeight - particle.height;
            particle.vy = 0;
            particle.onGround = true;
        } else {
            if (particle.y + particle.height < canvasHeight) {
                particle.onGround = false;
            }
        }
    }

    resolveCollision(p, o) {
        // if they are inside each other, move them apart
        const pCenter = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
        const oCenter = { x: o.x + o.width / 2, y: o.y + o.height / 2 };
        if (p.intersects(o)) {
            if (pCenter.x < oCenter.x) {
                p.x -= 1;
                o.x += 1;
            } else {
                p.x += 1;
                o.x -= 1;
            }

            if (pCenter.y < oCenter.y) {
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

    update(particles, quadtree, canvasWidth, canvasHeight) {
        quadtree.clear();

        for (let p of particles) {
            quadtree.insert(p);
        }

        for (let p of particles) {
            this.applyGravity(p);
            this.applyFriction(p);

            const newRectangle = new Rectangle(p.x, p.y, p.width, p.height);
            const points = quadtree.query(newRectangle);

            for (let other of points) {
                if (p !== other && p.checkCollisionAlongPath(other, 3)) {
                    this.resolveCollision(p, other);
                    break;
                }
            }

            // stop small movements
            if (Math.abs(p.vx) < 0.15) p.vx = 0;
            if (Math.abs(p.vy) < 0.15) p.vy = 0;

            this.handleEdgeCollisions(p, canvasWidth, canvasHeight);

            if (!p.frozen) {
                p.x += p.vx;
                p.y += p.vy;
            }
        }
    }
}
