class Particle {
    // position
    x = 0;
    y = 0;
    // velocity
    vy = 0;
    vx = 0;
    // dimensions
    height = 0;
    width = 0;
    // default number of steps to check for collision
    defaultNumSteps = 8; 
    frozen = false;

    constructor(x, y, vy, vx, height, width) {
        this.x = x;
        this.y = y;
        this.vy = vy;
        this.vx = vx;
        this.height = height;
        this.width = width;
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y;
    }

    checkCollisionWithVelocity(other) {
        return this.x + this.vx < other.x + other.width &&
            this.x + this.width + this.vx > other.x &&
            this.y + this.vy < other.y + other.height &&
            this.y + this.height + this.vy > other.y;
    }

    checkCollisionAlongPath(other, numSteps = defaultNumSteps) {    
        const stepX = this.vx / numSteps;
        const stepY = this.vy / numSteps;
    
        for (let i = 0; i <= numSteps; i++) {
            const newX = this.x + i * stepX;
            const newY = this.y + i * stepY;
    
            if (newX < other.x + other.width &&
                newX + this.width > other.x &&
                newY < other.y + other.height &&
                newY + this.height > other.y) {
                return true;
            }
        }
    
        return false;
    }
    
}
export { Particle };