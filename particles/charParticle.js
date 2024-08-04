import { Particle } from '../particle.js';

class CharParticle extends Particle {
    char = '#';

    constructor(char, x, y, vy, vx, size) {
        super(x, y, vy, vx, size, size);
        this.char = char;
    }
}

export { CharParticle };