import { CharParticle } from './particles/charParticle.js';
import { Rectangle } from './quadtree.js';
import { Particle } from './particle.js';

export class EventSystem {
    constructor(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.typedChars = [];
        this.typingStartX = this.canvas.width * 0.10;
        this.typingStartY = this.canvas.height * 0.25;
        this.typedCharsOffsetX = 0;
        this.typedCharsOffsetY = 0;
        this.charSize = 16;
        this.blockSize = this.charSize * 0.6;

        this.initMouseListeners();
        this.initKeyboardListeners();
    }

    initMouseListeners() {
        this.canvas.addEventListener('mouseup', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            if (e.ctrlKey) {
                const x = e.clientX;
                const y = e.clientY;

                const newRectangle = new Rectangle(x, y, 2, 2);
                const tempParticle = new Particle(x, y, 0, 0, 2, 2);
                const particles = this.engine.quadtree.query(newRectangle);

                particles.forEach(p => {

                    if (tempParticle.checkCollision(p))
                    {
                        // delete
                        this.engine.particles = this.engine.particles.filter(particle => particle !== p);
                    }
                });
            } else {
                this.engine.createParticle(x, y, 10, 55);
            }
        });

    }

    initKeyboardListeners() {
        window.addEventListener('keyup', (e) => {
            if (e.key.length === 1 && !e.ctrlKey) {
                this.addTypedCharacter(e.key);
            }

            if (e.key === 'Enter') {
                this.releaseTypedCharacters();
            }

            if (e.key === 'Backspace') {
                this.removeTypedCharacter();
            }

            // ctrl + q to pause
            if (e.key === 'q' && e.ctrlKey) {
                this.engine.paused = !this.engine.paused;
            }

            // ctrl + z to reset
            if (e.key === 'z' && e.ctrlKey) {
                this.engine.particles = [];
            }

            if (e.key === 'a' && e.ctrlKey) {
                this.engine.renderingSystem.debug = !this.engine.renderingSystem.debug;
            }
        });
    }

    addTypedCharacter(char) {
        if (this.typedCharsOffsetX > this.canvas.width * 0.8) {
            this.typedCharsOffsetX = 0;
            this.typedCharsOffsetY += this.blockSize + 1;
        }

        if (char !== ' ') {
            let newChar = new CharParticle(
                char,
                this.typingStartX + this.typedCharsOffsetX,
                this.typingStartY + this.typedCharsOffsetY,
                0,
                0,
                this.blockSize,
                this.blockSize
            );
            newChar.frozen = true;
            this.engine.particles.push(newChar);
            this.typedChars.push(newChar);
        }
        this.typedCharsOffsetX += this.blockSize + 1;
    }

    removeTypedCharacter() {
        if (this.typedChars.length === 0) {
            return
        }

        this.typedCharsOffsetX -= 17;
        if (this.typedCharsOffsetX < 0) {
            this.typedCharsOffsetX = 0;
        }
        this.engine.particles.pop();
        this.typedChars.pop();
    }

    releaseTypedCharacters() {
        for (let p of this.typedChars) {
            // reset velocity otherwise it builds up
            p.vy = 0;
            p.vx = 0;
            p.frozen = false;
        }
        this.typedCharsOffsetX = 0;
        this.typedChars = [];
    }
}