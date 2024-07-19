import { Rectangle } from './quadtree.js';

export class PhysicsSystem {
    constructor(gravityX = 0, gravityY = 1) {
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.frictionX = 0.9;
        this.frictionY = 0.9;
        this.maxVelocity = 100;
    }

    applyFriction(particle) {
        particle.vx *= this.frictionX;
        particle.vy *= this.frictionY;

        // if hit max stop (prevents jittering block when they're stuck)
        if (Math.abs(particle.vx) > this.maxVelocity) {
            particle.vx = 0;
        }

        if (Math.abs(particle.vy) > this.maxVelocity) {
            particle.vy = 0;
        }
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
        // find the direction of the collision
        const dx = (p.x + p.width / 2) - (o.x + o.width / 2);
        const dy = (p.y + p.height / 2) - (o.y + o.height / 2);

        if (p.intersects(o)) {
            // Calculate overlap in x and y directions
            const overlapX = (p.width / 2 + o.width / 2) - Math.abs(dx);
            const overlapY = (p.height / 2 + o.height / 2) - Math.abs(dy);
            // Resolve overlap by separating the particles
            const totalOverlap = Math.min(overlapX, overlapY);

            if (overlapX < overlapY) {
                if (dx > 0) {
                    p.x += totalOverlap / 2;
                    o.x -= totalOverlap / 2;
                } else {
                    p.x -= totalOverlap / 2;
                    o.x += totalOverlap / 2;
                }
            } else {
                if (dy > 0) {
                    p.y += totalOverlap / 2;
                    o.y -= totalOverlap / 2;
                } else {
                    p.y -= totalOverlap / 2;
                    o.y += totalOverlap / 2;
                }
            }
        }

        // find the angle of the collision
        const angle = Math.atan2(dy, dx);

        // scaling is used to prevent particles from jittering on top of each other
        let magnitudeScalingFactor = 3;
        if (p.intersects(o)) {
            magnitudeScalingFactor = 0.75;
        }

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

            // check for collisions along the path
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
                    break;
                }
            }

            // stop small movements
            if (Math.abs(p.vx) < 0.3) p.vx = 0;
            if (Math.abs(p.vy) < 0.3) p.vy = 0;

            this.handleEdgeCollisions(p, canvasWidth, canvasHeight);

            if (!p.frozen) {
                p.x += p.vx;
                p.y += p.vy;
            }
        }
    }
}
