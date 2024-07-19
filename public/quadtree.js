class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    intersects(range) {
        return !(range.x >= this.x + this.w ||
            range.x + range.w <= this.x ||
            range.y >= this.y + this.h ||
            range.y + range.h <= this.y);
    }

    
}

class Quadtree {
    constructor(x, y, width, height, capacity = 4, minSize = 10) {
        this.boundary = new Rectangle(x, y, width, height);
        this.capacity = capacity;
        this.minSize = minSize;
        this.particles = [];
        this.children = [];
    }

    setMinSize(size) {
        this.minSize = size;
    }

    visualize(ctx) {
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);

        for (let particle of this.particles) {
            ctx.fillStyle = 'white';
            ctx.fillRect(particle.x, particle.y, particle.w, particle.h);
        };

        this.children.forEach(child => child.visualize(ctx));

    }

    insert(particle) {
        if (!this.boundary.intersects(particle)) {
            return false;
        }

        if (this.particles.length < this.capacity) {
            this.particles.push(particle);
            return true;
        }

        if (this.children.length === 0) {
            this.subdivide();
        }

        for (let child of this.children) {
            if (child.insert(particle)) {
                return true;
            }
        }

        // If we reach here, the particle can't be inserted in any child
        // Possibly due to size constraints
        return false;
    }

    subdivide() {
        const { x, y, w, h } = this.boundary;
        const halfWidth = w / 2;
        const halfHeight = h / 2;

        if (halfWidth < this.minSize || halfHeight < this.minSize) {
            return;
        }

        this.children.push(new Quadtree(x, y, halfWidth, halfHeight, this.capacity, this.minSize));
        this.children.push(new Quadtree(x + halfWidth, y, halfWidth, halfHeight, this.capacity, this.minSize));
        this.children.push(new Quadtree(x, y + halfHeight, halfWidth, halfHeight, this.capacity, this.minSize));
        this.children.push(new Quadtree(x + halfWidth, y + halfHeight, halfWidth, halfHeight, this.capacity, this.minSize));
    }

    query(range, found = []) {
        if (!this.boundary.intersects(range)) {
            return found;
        }

        for (let particle of this.particles) {
            if (range.intersects(particle)) {
                found.push(particle);
            }
        }

        for (let child of this.children) {
            child.query(range, found);
        }

        return found;
    }

    clear() {
        this.particles = [];
        this.children = [];
    }
}

export { Rectangle, Quadtree };
