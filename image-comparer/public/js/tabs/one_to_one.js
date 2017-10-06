$("nav li a[href='#one-to-one']").first().parent().click(function () {

    if (!imageData.left) return;

    let leftCanvas = $("#left-canvas");
    let rightCanvas = $("#right-canvas");

    let scale = canvasUtils.calcScale(imageData.left);

    canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
    canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);

    let leftAbsCanvas = $("#can-abs-left");
    let rightAbsCanvas = $("#can-abs-right");

    function onMouseDown(x, y) {
        x = Math.floor(x / scale);
        y = Math.floor(y / scale);

        //console.log("x = " + x + " y = " + y);

        let leftSquare = canvasUtils.getSquareAtCoords(imageData.left, x, y);
        let rightSquare = canvasUtils.getSquareAtCoords(imageData.right, x, y);

        canvasUtils.drawIntoCanvas(leftSquare, leftAbsCanvas);
        canvasUtils.drawIntoCanvas(rightSquare, rightAbsCanvas);
    }

    canvasUtils.onMouseDownAbsolute(leftCanvas, onMouseDown);
    canvasUtils.onMouseDownAbsolute(rightCanvas, onMouseDown);
    //var img = getImage(rightCanvas, rightImageData);
    //document.write('<img src="'+img+'"/>');
    $(window).resize(function () {
        let scale = canvasUtils.calcScale(imageData.left);
        canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
        canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);
    });
});