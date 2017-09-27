$("nav li a[href='#histogram']").first().parent().click(function () {

    function getGrayScale(imageData) {
        let grayScale = {};
        for (let i = 0; i < 256; i++) {
            grayScale[i] = 0;
        }
        for (let i = 0; i < imageData.data.length; i += 4) {
            let color = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
            grayScale[color]++;
        }
        return grayScale;
    }

    function drawHistogram(imageData, histogramData) {

    }

    let leftGs = getGrayScale(imageData.left);
    let rightGs = getGrayScale(imageData.right);
    let iData = canvasUtils.getPrescaledImageData();


    let canvas = $("#diff-canvas");
    canvasUtils.drawIntoCanvas(iData, canvas, 1);

    $(window).resize(function () {
        let scale = canvasUtils.calcScale(diffImageData, 1);
        let canvas = $("#diff-canvas");
        canvasUtils.drawIntoCanvas(diffImageData, canvas, scale);
    });
});