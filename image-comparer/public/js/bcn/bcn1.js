var bc1 = (function () {

    var encode = function (imageData) {
        var w = imageData.width;
        var h = imageData.height;
        var src = imageData.data;

        var dest = new Uint16Array(w * h / 4);
        var destIndex = 0;

        for (var y = 0; y < h; y += 4) {
            for (var x = 0; x < w; x += 4, destIndex += 4) {
                var minR = 255, minG = 255, minB = 255,
                    maxR = 0, maxG = 0, maxB = 0;

                var samples = new Uint8Array(16 * 3);
                var s_i = 0;
                for (var i = y; i < h && i < y + 4; i++) {
                    for (var j = x; j < w && j < x + 4; j++) {
                        var index = (i * w + j) * 4;
                        var r = src[index];
                        var g = src[index + 1];
                        var b = src[index + 2];

                        samples[s_i++] = r;
                        samples[s_i++] = g;
                        samples[s_i++] = b;

                        if (r < minR) minR = r;
                        if (g < minG) minG = g;
                        if (b < minB) minB = b;

                        if (r > maxR) maxR = r;
                        if (g > maxG) maxG = g;
                        if (b > maxB) maxB = b;
                    }
                }

                //convert endpoint colors to 5:6:5 format
                var color1 = 2048 * Math.floor(minR / 8) + 32 * Math.floor(minG / 6) + Math.floor(minB / 8);
                var color2 = 2048 * Math.floor(maxR / 8) + 32 * Math.floor(maxG / 6) + Math.floor(maxB / 8);

                if (color1 === color2) {
                    dest[destIndex] = color1;
                    dest[destIndex + 1] = color2;
                    dest[destIndex + 2] = destIndex[3] = 0;
                } else if (color1 > color2) {
                    var temp = minR;
                    minR = maxR;
                    maxR = temp;

                    temp = minG;
                    minG = maxG;
                    maxG = temp;

                    temp = minB;
                    minB = maxB;
                    maxB = temp;
                }

                var dR = (maxR - minR) / 255;
                var dG = (maxG - minG) / 255;
                var dB = (maxB - minB) / 255;

                var len = Math.sqrt(dR * dR + dG * dG + dB * dB);

                var nR = dR / len;
                var nG = dG / len;
                var nB = dB / len;

                // create binary representation of block

                for (var p = 0; p < 8; p++) {
                    var ind = 0;

                    var diffR = (samples[p] - minR) / 255;
                    var diffG = (samples[p + 1] - minG) / 255;
                    var diffB = (samples[p + 2] - minB) / 255;

                    var i_val = (diffR * nR + diffG * nG + diffB * nB) / len;

                }

            }
        }
    };

    return {
        encode: encode
    }

})();