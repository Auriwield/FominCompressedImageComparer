const bc1 = (function () {

    const encode = function (imageData) {
        let w = imageData.width;
        let h = imageData.height;
        let src = imageData.data;

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

                let minColorInt = minColor.toUint16();
                let maxColorInt = maxColor.toUint16();
                if (minColorInt === maxColorInt) {
                    dest[destIndex] = minColorInt;
                    dest[destIndex + 1] = maxColorInt;
                    dest[destIndex + 2] = destIndex[3] = 0;
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

                // create binary representation of block
                dest[destIndex + 2] = dest[destIndex + 3] = 0;
                for (let i = 0; i < 8; i++) {
                    let minDistance = Number.MIN_SAFE_INTEGER;
                    let minIndex = -1;
                    for (let j = 0; j < colors.length; j++) {
                        let d = samples[i].distanceTo(colors[j]);
                        if (d < minDistance) {
                            minDistance = d;
                            minIndex = j;
                        }
                    }

                    dest[destIndex + (i < 8 ? 2 : 3)] += minIndex * Math.pow(2, i * 2);
                }

            }
        }

        return {
            width: w,
            height: h,
            data: dest
        }
    };

    return {
        encode: encode
    }

})();