$("nav li a[href='#diff']").first().parent().click(function () {

    if (!imageData.left) return;

    function getDiff(leftImageData, rightImageData) {
        let dest = new Uint8ClampedArray(leftImageData.data.length);
        for (let i = 0; i < leftImageData.data.length; i += 4) {
            for (let j = i; j < i + 3; j++) {
                dest[j] = Math.abs(leftImageData.data[j] - rightImageData.data[j])
            }
            dest[i + 3] = 255;
        }
        return dest;
    }

    let diffSrc = getDiff(imageData.left, imageData.right);
    let diffImageData = new ImageData(diffSrc, imageData.left.width, imageData.left.height);

    let scale = canvasUtils.calcScale(diffImageData, 1);
    let canvas = $("#diff-canvas");
    canvasUtils.drawIntoCanvas(diffImageData, canvas, scale);

    $(window).resize(function () {
        let scale = canvasUtils.calcScale(diffImageData, 1);
        let canvas = $("#diff-canvas");
        canvasUtils.drawIntoCanvas(diffImageData, canvas, scale);
    });
});