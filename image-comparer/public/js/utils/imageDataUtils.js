const canvasUtils = (function () {

    // noinspection JSUnusedGlobalSymbols
    function getImage(canvas, imageData) {
        drawIntoCanvas(imageData, canvas, 1.0);
        return canvas[0].toDataURL();
    }

    function drawIntoCanvas(imageData, canvas, scale) {
        let ctx = canvas[0].getContext("2d");
        if (!scale) scale = calcScale(imageData);
        canvas[0].width = imageData.width * scale;
        canvas[0].height = imageData.height * scale;

        if (scale !== 1)
            imageData = scaleImageData(imageData, scale);
        else
            imageData = new ImageData(imageData.data, imageData.width, imageData.height);

        ctx.putImageData(imageData, 0, 0);
    }

    function calcScale(imageData, multiplier = 2) {
        let maxWidth = $(window).width() / multiplier * 0.9;
        let maxHeight = ($(window).height() - $(".header").height()) * 0.9;
        let mpX = maxWidth / imageData.width;
        let mpY = maxHeight / imageData.height;
        return Math.min(mpX, mpY);
    }

    function getPrescaledImageData() {
        let maxWidth = $(window).width() * 0.8;
        let maxHeight = ($(window).height() - $(".header").height()) * 0.8;
        return new ImageData(new Uint8ClampedArray(maxWidth * maxHeight * 4), maxWidth, maxHeight);
    }

    function scaleImageData(imageData, scale) {
        let h1 = imageData.height;
        let w1 = imageData.width;
        let w2 = Math.floor(w1 * scale);
        let h2 = Math.floor(h1 * scale);

        let srcLength = h1 * w1 * 4;
        let destLength = w2 * h2 * 4;

        let src = imageData.data;
        let dest = new Uint8ClampedArray(destLength);

        for (let y = 0; y < h2; y++) {
            for (let x = 0; x < w2; x++) {
                let x1 = Math.floor(x / scale);
                let y1 = Math.floor(y / scale);

                if (x1 < 0 || x1 >= w1 || y1 < 0 || y1 >= h1)
                    continue;

                if (x < 0 || x >= w2 || y < 0 || y >= h2)
                    continue;

                let destIndex = (y * w2 + x) * 4;
                let sourceIndex = (y1 * w1 + x1) * 4;

                if (destIndex + 3 >= destLength || destIndex < 0
                    || sourceIndex + 3 >= srcLength || sourceIndex < 0) continue;


                for (let i = 0; i < 4; i++) {
                    dest[destIndex + i] = src[sourceIndex + i];
                }
            }
        }

        return new ImageData(dest, w2, h2);
    }

    function getImageData(file) {
        let url = window.URL.createObjectURL(file);
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        let image = new Image();
        let promise = new window.Promise(function (resolve) {
            image.onload = function () {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                resolve(ctx.getImageData(0, 0, image.width, image.height));
            };
        });
        image.src = url;
        return promise;
    }

    return {
        getImage: getImage,
        drawIntoCanvas: drawIntoCanvas,
        calcScale: calcScale,
        scaleImageData: scaleImageData,
        getImageData: getImageData,
        getPrescaledImageData: getPrescaledImageData
    }
})();

