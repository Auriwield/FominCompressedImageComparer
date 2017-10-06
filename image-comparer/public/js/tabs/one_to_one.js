$("nav li a[href='#one-to-one']").first().parent().click(function () {

    if (!imageData.left) return;

    let leftCanvas = $("#left-canvas");
    let rightCanvas = $("#right-canvas");

    let scale = canvasUtils.calcScale(imageData.left);

    canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
    canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);

    let leftAbsCanvas = $("#can-abs-left");
    let rightAbsCanvas = $("#can-abs-right");

    let leftRect = leftCanvas[0].getBoundingClientRect();
    let rightRect = rightCanvas[0].getBoundingClientRect();

    function onMouseDown(x, y) {
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

        //console.log("x = " + x + " y = " + y);

        let leftSquare = canvasUtils.getSquareAtCoords(imageData.left, x, y);
        let rightSquare = canvasUtils.getSquareAtCoords(imageData.right, x, y);

        leftSquare = canvasUtils.scaleImageData(leftSquare, 20);
        rightSquare = canvasUtils.scaleImageData(rightSquare, 20);

        leftSquare = canvasUtils.applyBorder(leftSquare, 1, new Color(255, 255, 255, 255));
        rightSquare = canvasUtils.applyBorder(rightSquare, 1, new Color(255, 255, 255, 255));

        canvasUtils.drawIntoCanvas(leftSquare, leftAbsCanvas, 1);
        canvasUtils.drawIntoCanvas(rightSquare, rightAbsCanvas, 1);
    }

    canvasUtils.onMouseDownAbsolute(leftCanvas, onMouseDown);
    canvasUtils.onMouseDownAbsolute(rightCanvas, onMouseDown);

    $("body").mouseup(() => {
        leftAbsCanvas.addClass("hidden");
        rightAbsCanvas.addClass("hidden");
    });

    //var img = getImage(rightCanvas, rightImageData);
    //document.write('<img src="'+img+'"/>');
    $(window).resize(function () {
        let scale = canvasUtils.calcScale(imageData.left);
        canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
        canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);
    });
});