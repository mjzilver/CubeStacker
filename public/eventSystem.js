import { CharParticle } from './particles/charParticle.js';

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
        window.handleFileSelect = this.handleFileSelect;
    }

    initMouseListeners() {
        this.canvas.addEventListener('mouseup', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            this.engine.createParticle(x, y, 10, 55);
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

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                this.addTypedCharacter(char);
            }
            this.releaseTypedCharacters();

        };
        reader.readAsText(file);
    }
    
}



