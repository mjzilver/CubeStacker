import { Particle } from '../particle.js';

class CubeParticle extends Particle {
    color = 'white';
    defaultNumSteps = 3;

    constructor(x, y, vy, vx, size) {
        super(x, y, vy, vx, size, size);
    }
}

export { CubeParticle };
