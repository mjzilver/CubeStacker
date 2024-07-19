class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (point.x >= this.x - this.w &&
            point.x + point.width < this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y + point.height < this.y + this.h);
    }

    intersects(range) {
        return !(range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h);
    }
}

class Quadtree {
    constructor(x, y, width, height, capacity = 4) {
        this.boundary = new Rectangle(x, y, width, height);
        this.capacity = capacity;
        this.particles = [];
        this.children = [];
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
        if (!this.boundary.contains(particle)) {
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

        console.debug('Failed to insert particle');
        return false;
    }

    subdivide() {
        const { x, y, w, h } = this.boundary;
        const halfWidth = w / 2;
        const halfHeight = h / 2;

        this.children.push(new Quadtree(x, y, halfWidth, halfHeight, this.capacity));
        this.children.push(new Quadtree(x + halfWidth, y, halfWidth, halfHeight, this.capacity));
        this.children.push(new Quadtree(x, y + halfHeight, halfWidth, halfHeight, this.capacity));
        this.children.push(new Quadtree(x + halfWidth, y + halfHeight, halfWidth, halfHeight, this.capacity));
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
