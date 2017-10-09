$("nav li a[href='#histogram']").first().parent().click(function () {

    if (!imageData.left) return;

    function cerp(a, b, m) {
        let m2 = (1 - Math.cos(m * Math.PI)) / 2;
        return (a * (1 - m2) + b * m2);
    }

    function computeHistogram(imageData) {
        let histogram = {};
        histogram.length = 255;
        for (let i = 0; i <= histogram.length; i++) {
            histogram[i] = 0;
        }
        for (let i = 0; i < imageData.data.length; i += 4) {
            let color = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
            histogram[color]++;
        }
        return histogram;
    }

    function setPixel(imageData, index, color) {
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = color.a
    }

    function drawGrayscaleHistogram(imageData, histogramData, color) {
        let max = 0;
        for (let i = 0; i < histogramData.length; i++) {
            if (histogramData[i] > max)
                max = histogramData[i];
        }

        let coords = new Array(imageData.width);

        for (let x = 0; x < imageData.width; x++) {
            let leftIndex = Math.floor(x / imageData.width * histogramData.length);
            let rightIndex = leftIndex + 1;
            if (rightIndex > 255) rightIndex = 255;

            let x1 = Math.floor(leftIndex * imageData.width / histogramData.length);
            let x2 = Math.floor(rightIndex * imageData.width / histogramData.length);
            let m = (x - x1) / (x2 - x1);

            let y1 = cerp(histogramData[leftIndex], histogramData[rightIndex], m);
            coords[x] = imageData.height - Math.floor(y1 / max * imageData.height);

            /*   let index = (y * imageData.width + x) * 4;
        ;*/
        }

        for (let x = 0; x < imageData.width - 1; x++) {
            let bot = coords[x];
            let top = coords[x + 1];
            if (bot >= top) {
                for (let i = top; i <= bot; i++) {
                    let w = Math.floor(cerp(x + 1, x, (i - top) / (bot - top)));
                    let index = (i * imageData.width + w) * 4;
                    setPixel(imageData, index, color);
                }
            } else {
                for (let i = bot; i <= top; i++) {
                    let w = Math.floor(cerp(x, x + 1, (i - bot) / (top - bot)));
                    let index = (i * imageData.width + w) * 4;
                    setPixel(imageData, index, color);
                }
            }
        }
    }

    function drawRGBHistogram(src, w2, h2, R = true, G = true, B = true) {
        let mapR = {};
        let mapG = {};
        let mapB = {};

        let dest = new Uint8ClampedArray(w2 * h2 * 4);

        for (let i = 0; i <= 255; i++) {
            mapR[i] = 0;
            mapG[i] = 0;
            mapB[i] = 0;
        }

        for (let i = 0; i < src.data.length; i += 4) {
            let a = src.data[i + 3];

            if (R) {
                let index = Math.floor(src.data[i] * (a / 255));
                mapR[index]++;
            }

            if (B) {
                let index = Math.floor(src.data[i + 1] * (a / 255));
                mapG[index]++;
            }

            if (G) {
                let index = Math.floor(src.data[i + 2] * (a / 255));
                mapB[index]++;
            }
        }

        let maxR = 0;
        let maxG = 0;
        let maxB = 0;

        if (R) {
            for (let i = 0; i < 255; i++) {
                if (mapR[i] > maxR) maxR = mapR[i];
            }
        }
        if (G) {
            for (let i = 0; i < 255; i++) {
                if (mapG[i] > maxG) maxG = mapG[i];
            }
        }
        if (B) {
            for (let i = 0; i < 255; i++) {
                if (mapB[i] > maxB) maxB = mapB[i];
            }
        }

        let dw = w2 / 256;

        let dhR = h2 / maxR;
        let dhG = h2 / maxG;
        let dhB = h2 / maxB;

        for (let i = 0; i < h2; i++) {
            for (let j = 0; j < w2; j++) {
                let destIndex = (i * w2 + j) * 4;

                let srcIndex = Math.floor(j / dw);
                let srcIndex2 = srcIndex < 255 ? srcIndex + 1 : 255;
                let t = j / dw - srcIndex;

                if (R && (h2 - i) / dhR <= (1 - t) * mapR[srcIndex] + t * mapR[srcIndex2]) {
                    dest[destIndex] = 255;
                    dest[destIndex + 3] = 255;
                }
                if (G && (h2 - i) / dhG <= (1 - t) * mapG[srcIndex] + t * mapG[srcIndex2]) {
                    dest[destIndex + 1] = 255;
                    dest[destIndex + 3] = 255;
                }
                if (B && (h2 - i) / dhB <= (1 - t) * mapB[srcIndex] + t * mapB[srcIndex2]) {
                    dest[destIndex + 2] = 255;
                    dest[destIndex + 3] = 255;
                }
            }
        }

        return new ImageData(dest, w2, h2);
    }

    function updateView() {

        let leftCanvas = $("#hist-canvas-left");
        let rightCanvas = $("#hist-canvas-right");

        if (true) {
            let w = $(window).width() * 0.9 / 2;
            let h = ($(window).height() - $(".header").height()) * 0.9;
            w = Math.floor(w);
            h = Math.floor(h);

            let leftData = drawRGBHistogram(imageData.left, w, h);
            let rightData = drawRGBHistogram(imageData.right, w, h);

            canvasUtils.drawIntoCanvas(leftData, leftCanvas, 1);
            canvasUtils.drawIntoCanvas(rightData, rightCanvas, 1);
        } else {
            let leftGs = computeHistogram(imageData.left);
            let rightGs = computeHistogram(imageData.right);
            let iDataLeft = canvasUtils.getPrescaledImageData();
            let iDataRight = canvasUtils.getPrescaledImageData();

            drawGrayscaleHistogram(iDataLeft, leftGs, new Color(255, 0, 0, 255));
            drawGrayscaleHistogram(iDataRight, rightGs, new Color(0, 255, 0, 255));

            canvasUtils.drawIntoCanvas(iDataLeft, leftCanvas, 1);
            canvasUtils.drawIntoCanvas(iDataRight, rightCanvas, 1);
        }

    }

    updateView();

    $(window).resize(updateView);
});