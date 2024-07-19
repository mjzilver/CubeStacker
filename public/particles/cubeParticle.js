import { Particle } from '../particle.js';

class CubeParticle extends Particle {
    color = 'grey';
    defaultNumSteps = 3;

    constructor(x, y, vy, vx, size) {
        super(x, y, vy, vx, size, size);
        this.weight = size; 
    }
}

export { CubeParticle };
