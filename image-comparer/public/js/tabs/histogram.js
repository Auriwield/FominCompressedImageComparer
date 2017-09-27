$("nav li a[href='#histogram']").first().parent().click(function () {

    function cosineInterpolate(a, b, m) {
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

    function drawHistogram(imageData, histogramData, color) {
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

            let y1 = cosineInterpolate(histogramData[leftIndex], histogramData[rightIndex], m);
            coords[x] = imageData.height - Math.floor(y1 / max * imageData.height);

            /*   let index = (y * imageData.width + x) * 4;
        ;*/
        }

        for (let x = 0; x < imageData.width - 1; x++) {
            let bot = coords[x];
            let top = coords[x + 1];
            if (bot < top) {
                let temp = bot;
                bot = top;
                top = temp;
            }
            setPixel(imageData, left,);

            for (let i = top; i <= bot; i++) {
                let h = cosineInterpolate(top, bot, (i - top) / (bot - top));
                let index = (i*imageData.width)
                setPixel(imageData, )
            }
        }
    }

    function updateView() {
        let leftGs = computeHistogram(imageData.left);
        let rightGs = computeHistogram(imageData.right);
        let iData = canvasUtils.getPrescaledImageData();

        drawHistogram(iData, leftGs, new Color(255, 0, 0, 255));
        drawHistogram(iData, rightGs, new Color(0, 255, 0, 255));

        let canvas = $("#hist-canvas");
        canvasUtils.drawIntoCanvas(iData, canvas, 1);
    }

    updateView();

    $(window).resize(updateView);
});