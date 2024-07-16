class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (point.x >= this.x - this.w &&
            point.x < this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y < this.y + this.h);
    }

    intersects(range) {
        return !(range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h);
    }
}

class Quadtree {
    capacity = 4;
    minSize = 10;

    boundary = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    children = [];
    points = [];

    constructor(x, y, width, height) {
        this.boundary = { x, y, width, height };
    }

    setMinSize(size) {
        this.minSize = size;
    }

    visualize(ctx) {
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);

        this.children.forEach(child => child.visualize(ctx));

        this.points.forEach(point => {
            ctx.fillStyle = 'white';
            ctx.fillRect(point.x, point.y, 2, 2);
        });
    }

    insert(point) {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (this.children.length < this.capacity) {
            this.subdivide();
        }

        return this.children.some(child => child.insert(point));
    }

    subdivide() {
        const { x, y, width, height } = this.boundary;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // Ensure minimum size for each quadrant
        if (halfWidth < this.minimumSize || halfHeight < this.minimumSize) {
            console.log('Cannot subdivide further due to minimum size constraint.');
            return;
        }

        this.children.push(new Quadtree(x, y, halfWidth, halfHeight));
        this.children.push(new Quadtree(x + halfWidth, y, halfWidth, halfHeight));
        this.children.push(new Quadtree(x, y + halfHeight, halfWidth, halfHeight));
        this.children.push(new Quadtree(x + halfWidth, y + halfHeight, halfWidth, halfHeight));
    }

    contains(point) {
        const { x, y, width, height } = this.boundary;
        return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
    }

    query(range, found = []) {
        if (!range.intersects(this.boundary)) {
            return found;
        }

        this.points.forEach(point => {
            if (range.contains(point)) {
                found.push(point);
            }
        });

        this.children.forEach(child => child.query(range, found));

        return found;
    }
    
    clear() {
        this.points = [];
        this.children = [];
    }
}

export { Rectangle, Quadtree };