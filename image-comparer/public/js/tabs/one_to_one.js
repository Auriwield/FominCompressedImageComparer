$("nav li a[href='#one-to-one']").first().parent().click(function () {

    if (!imageData.left) return;

    canvasUtils.clearMouseCallbacks();

    let leftCanvas = $("#left-canvas");
    let rightCanvas = $("#right-canvas");

    let scale = canvasUtils.calcScale(imageData.left);

    canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
    canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);

    let leftAbsCanvas = $("#can-abs-left");
    let rightAbsCanvas = $("#can-abs-right");

    //info

    let xInfo = $("#info-x");
    let yInfo = $("#info-y");
    let mseInfo = $("#info-mse");
    let globalMseInfo = $("#info-gl-mse");

    let globalMse = canvasUtils.getMse(imageData.left, imageData.right);
    globalMseInfo.text(Math.floor(globalMse*100)/100);

    function drawBlocks(x, y, leftRect, rightRect) {
        leftAbsCanvas.removeClass("hidden");
        rightAbsCanvas.removeClass("hidden");

        let absLeftX = leftRect.left + x + 20;
        let absLeftY = leftRect.top + y - 10;

        let absRightX = rightRect.left + x + 20;
        let absRightY = rightRect.top + y - 10;

        //console.log("absLeftX = " + absLeftX + " absLeftY = " + absLeftY);

        leftAbsCanvas.css('left', absLeftX);
        leftAbsCanvas.css('top', absLeftY);

        rightAbsCanvas.css('left', absRightX);
        rightAbsCanvas.css('top', absRightY);

        x = Math.floor(x / scale);
        y = Math.floor(y / scale);

        let leftSquare = canvasUtils.getSquareAtCoords(imageData.left, x, y);
        let rightSquare = canvasUtils.getSquareAtCoords(imageData.right, x, y);

        xInfo.text(x);
        yInfo.text(y);
        let mse = canvasUtils.getMse(leftSquare, rightSquare);
        mseInfo.text(Math.floor(mse*100)/100);

        leftSquare = canvasUtils.scaleImageData(leftSquare, 20);
        rightSquare = canvasUtils.scaleImageData(rightSquare, 20);

        leftSquare = canvasUtils.applyBorder(leftSquare, 1, new Color(255, 255, 255, 255));
        rightSquare = canvasUtils.applyBorder(rightSquare, 1, new Color(255, 255, 255, 255));

        canvasUtils.drawIntoCanvas(leftSquare, leftAbsCanvas, 1);
        canvasUtils.drawIntoCanvas(rightSquare, rightAbsCanvas, 1);
    }

    function onMouseDown(x, y) {
        let leftRect = leftCanvas[0].getBoundingClientRect();
        let rightRect = rightCanvas[0].getBoundingClientRect();

        if (canvasUtils.pointInRect(x, y, leftRect)) {
            x -= leftRect.left;
            y -= leftRect.top;

            drawBlocks(x, y, leftRect, rightRect);
        } else if (canvasUtils.pointInRect(x, y, rightRect)) {
            x -= rightRect.left;
            y -= rightRect.top;

            drawBlocks(x, y, leftRect, rightRect);
        } else {
            leftAbsCanvas.addClass("hidden");
            rightAbsCanvas.addClass("hidden");

            xInfo.text("-");
            yInfo.text("-");
            mseInfo.text("-");
        }
    }

    canvasUtils.onMouseDownAbsolute(onMouseDown);
    //canvasUtils.onMouseDownAbsolute(rightCanvas, onMouseDown);

  /*  $(document.body).mouseup(() => {
        leftAbsCanvas.addClass("hidden");
        rightAbsCanvas.addClass("hidden");
    });
*/
    //var img = getImage(rightCanvas, rightImageData);
    //document.write('<img src="'+img+'"/>');
    $(window).resize(function () {
        scale = canvasUtils.calcScale(imageData.left);
        canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
        canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);
    });
});