const bc1 = (function () {

    const encode = function (imageData) {
        let w = imageData.width;
        let h = imageData.height;
        let src = imageData.data;

        if (w % 4 !== 0 || h % 4 !== 0) {
            let data = bcnUtils.expandImage(imageData);
            w = data.width;
            h = data.height;
            src = data.data;
        }

        let dest = new Uint16Array(w * h / 4);
        let destIndex = 0;

        for (let y = 0; y < h; y += 4) {
            for (let x = 0; x < w; x += 4, destIndex += 4) {
                let minColor = new Color(255, 255, 255, 255);
                let maxColor = new Color(0, 0, 0, 0);

                let samples = [];

                for (let i = y; i < h && i < y + 4; i++) {
                    for (let j = x; j < w && j < x + 4; j++) {
                        let index = (i * w + j) * 4;

                        let r = src[index];
                        let g = src[index + 1];
                        let b = src[index + 2];
                        let a = src[index + 3];

                        let color = new Color(r, g, b, a);
                        samples.push(color);

                        minColor.min(color);
                        maxColor.max(color);
                    }
                }

                // create binary representation of block

                let minColorInt = minColor.toUint16();
                let maxColorInt = maxColor.toUint16();
                if (minColorInt === maxColorInt) {
                    dest[destIndex] = minColorInt;
                    dest[destIndex + 1] = maxColorInt;
                    dest[destIndex + 2] = dest[destIndex + 3] = 0;
                    continue;
                } else if (minColorInt > maxColorInt) {
                    let temp = minColor;
                    minColor = maxColor;
                    maxColor = temp;
                }

                let colors = [];

                colors.push(minColor);
                colors.push(maxColor);
                colors.push(minColor.plus(maxColor, 2 / 3, 1 / 3));
                colors.push(minColor.plus(maxColor, 1 / 3, 2 / 3));

                dest[destIndex] = minColorInt;
                dest[destIndex + 1] = maxColorInt;
                dest[destIndex + 2] = dest[destIndex + 3] = 0;
                for (let i = 0; i < samples.length; i++) {
                    let minDistance = Number.MAX_SAFE_INTEGER;
                    let minIndex = -1;
                    for (let j = 0; j < colors.length; j++) {
                        let d = samples[i].distanceTo(colors[j]);
                        if (d < minDistance) {
                            minDistance = d;
                            minIndex = j;
                        }
                    }
                    let index = destIndex + (i < 8 ? 2 : 3);
                    dest[index] += minIndex * Math.pow(2, (i % 8) * 2);
                }
            }
        }

        return {
            width: w,
            height: h,
            actualWidth: imageData.width,
            actualHeight: imageData.height,
            data: dest
        }
    };

    const decode = function (compressedImageData) {
        let w = compressedImageData.width;
        let h = compressedImageData.height;
        let src = compressedImageData.data;
        let dest = new Uint8ClampedArray(src.length * 16);

        for (let i = 0; i < src.length; i += 4) {
            let colors = [];
            colors.push(new Color(src[i]));
            colors.push(new Color(src[i + 1]));

            let blocksInLine = w / 4;
            let blockIndex = (Math.floor(i / 4 / blocksInLine) * 4 * w + ((i / 4) % blocksInLine) * 4) * 4;

            if (colors[0].toUint16() === colors[1].toUint16()) {
                for (let j = 0; j < 16; j++) {
                    let destIndex = blockIndex + (Math.floor(j / 4) * w + j % 4) * 4;
                    dest[destIndex] = colors[0].r;
                    dest[destIndex + 1] = colors[0].g;
                    dest[destIndex + 2] = colors[0].b;
                    dest[destIndex + 3] = colors[0].a;
                }
                continue;
            }

            colors.push(colors[0].plus(colors[1], 2 / 3, 1 / 3));
            colors.push(colors[0].plus(colors[1], 1 / 3, 2 / 3));

            for (let j = 0; j < 16; j++) {
                let bits = src[i + (j < 8 ? 2 : 3)];
                let colorIndex = (bits >> (j % 8) * 2) & 3;

                let destIndex = blockIndex + (Math.floor(j / 4) * w + j % 4) * 4;
                let color = colors[colorIndex];

                dest[destIndex] = color.r;
                dest[destIndex + 1] = color.g;
                dest[destIndex + 2] = color.b;
                dest[destIndex + 3] = color.a;
            }

        }

        let aW = compressedImageData.actualWidth;
        let aH = compressedImageData.actualHeight;

        if (aW && aH) {
            return bcnUtils.shrinkImage(new ImageData(dest, w, h), aW, aH)
        }

        return {
            width: w,
            height: h,
            data: dest
        }
    };

    return {
        encode: encode,
        decode: decode
    }

})();