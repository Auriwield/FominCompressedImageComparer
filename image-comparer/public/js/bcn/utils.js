const bcnUtils = (function () {


    const expandImage = (imageData) => {
        let w = imageData.width + 4 - imageData.width % 4;
        let h = imageData.height + 4 - imageData.height % 4;
        let dest = new Uint8ClampedArray(w * h * 4);

        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                let srcIndex = (y * imageData.width + x) * 4;
                let destIndex = (y * w + x) * 4;

                dest[destIndex] = imageData.data[srcIndex];
                dest[destIndex + 1] = imageData.data[srcIndex + 1];
                dest[destIndex + 2] = imageData.data[srcIndex + 2];
                dest[destIndex + 3] = imageData.data[srcIndex + 3];
            }
        }

        if (w !== imageData.width) {
            for (let y = 0; y < h; y++) {
                for (let x = imageData.width; x < w; x++) {
                    let srcIndex = (y * w + imageData.width - 1) * 4;
                    let destIndex = (y * w + x) * 4;

                    dest[destIndex] = dest[srcIndex];
                    dest[destIndex + 1] = dest[srcIndex + 1];
                    dest[destIndex + 2] = dest[srcIndex + 2];
                    dest[destIndex + 3] = dest[srcIndex + 3];
                }
            }
        }

        if (h !== imageData.height) {
            for (let y = imageData.height; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    let srcIndex = ( (imageData.height - 1) * w + x ) * 4;
                    let destIndex = (y * w + x) * 4;

                    dest[destIndex] = dest[srcIndex];
                    dest[destIndex + 1] = dest[srcIndex + 1];
                    dest[destIndex + 2] = dest[srcIndex + 2];
                    dest[destIndex + 3] = dest[srcIndex + 3];
                }
            }
        }

        return new ImageData(dest, w, h);
    };

    const shrinkImage = (imageData, w, h) => {

        if (w > imageData.width) w = imageData.width;
        if (h > imageData.height) h = imageData.height;

        let dest = new Uint8ClampedArray(w * h * 4);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let srcIndex = (y * imageData.width + x) * 4;
                let destIndex = (y * w + x) * 4;

                dest[destIndex] = imageData.data[srcIndex];
                dest[destIndex + 1] = imageData.data[srcIndex + 1];
                dest[destIndex + 2] = imageData.data[srcIndex + 2];
                dest[destIndex + 3] = imageData.data[srcIndex + 3];
            }
        }

        return new ImageData(dest, w, h);
    };

    return {
        expandImage,
        shrinkImage
    }

})();