class Color {
    constructor(r, g, b, a) {
        if (arguments.length === 1) {
            this.createFrom565color(arguments[0]);
            return;
        }

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    // create from 5/6/5 (16-bit) encoded color
    // rrrrr gggggg bbbbb
    createFrom565color(_565color) {
        let r = _565color >>> 11;
        let g = (_565color & 11111100000) >>> 5;
        let b = _565color & 11111;

        this.r = r * 8;
        this.g = g * 6;
        this.b = b * 8;
        this.a = 255;
    }

    toUint16() {
        let color = new Uint16Array(1);
        color[0] = 2048 * Math.floor(this.r / 8) + 32 * Math.floor(this.g / 6) + Math.floor(this.b / 8);
        return color[0];
    }

    normalize() {
        if (this.r > 1 || this.g > 1 || this.b > 1 || this.a > 1) {
            this.r /= 255;
            this.g /= 255;
            this.b /= 255;
            this.a /= 255;
        }
    }

    min(color) {
        if (color.r < this.r) this.r = color.r;
        if (color.g < this.g) this.g = color.g;
        if (color.b < this.b) this.b = color.b;
    }

    max(color) {
        if (color.r > this.r) this.r = color.r;
        if (color.g > this.g) this.g = color.g;
        if (color.b > this.b) this.b = color.b;
    }

    // return a dot product of two color-vectors
    // m1 this color multiplier
    // m2 color multiplier
    plus(color, m1, m2) {
        let r = this.r * m1 + color.r * m2;
        let g = this.g * m1 + color.g * m2;
        let b = this.b * m1 + color.b * m2;

        return new Color(r, g, b);
    }

    distanceTo(color) {
        let rDiff = this.r - color.r;
        let gDiff = this.g - color.g;
        let bDiff = this.b - color.b;
        let dot = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
        return Math.sqrt(dot);
    }
}