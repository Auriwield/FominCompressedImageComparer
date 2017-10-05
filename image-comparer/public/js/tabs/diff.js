$("nav li a[href='#diff']").first().parent().click(function () {

    if (!imageData.left) return;

    function getDiff(leftImageData, rightImageData, mp = 1.0) {
        let dest = new Uint8ClampedArray(leftImageData.data.length);
        for (let i = 0; i < leftImageData.data.length; i += 4) {
            for (let j = i; j < i + 3; j++) {
                let value = Math.abs(leftImageData.data[j] - rightImageData.data[j]) * mp;
                dest[j] = value > 255 ? 255 : value;
            }
            dest[i + 3] = 255;
        }
        return dest;
    }

    let rangeBar = $("input.diff-bar:first");
    let lastMp = 1;
    let lastDiffSrc = getDiff(imageData.left, imageData.right);

    function showDiff() {
        let mp = parseFloat(rangeBar.val());
        let diffSrc;
        if (mp !== lastMp)
            diffSrc = getDiff(imageData.left, imageData.right, mp);
        else
            diffSrc = lastDiffSrc;

        let diffImageData = new ImageData(diffSrc, imageData.left.width, imageData.left.height);
        let scale = canvasUtils.calcScale(diffImageData, 1);
        let canvas = $("#diff-canvas");
        canvasUtils.drawIntoCanvas(diffImageData, canvas, scale);
    }

    $(window).resize(showDiff);
    rangeBar.on("input change", showDiff);
    showDiff();
});