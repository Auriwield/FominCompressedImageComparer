$("nav li a[href='#one-to-one']").first().parent().click(function () {

    if (!imageData.left) return;

    let leftCanvas = $("#left-canvas");
    let rightCanvas = $("#right-canvas");

    let scale = canvasUtils.calcScale(imageData.left);

    canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
    canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);
    //var img = getImage(rightCanvas, rightImageData);
    //document.write('<img src="'+img+'"/>');
    $(window).resize(function () {
        let scale = canvasUtils.calcScale(imageData.left);
        canvasUtils.drawIntoCanvas(imageData.left, leftCanvas, scale);
        canvasUtils.drawIntoCanvas(imageData.right, rightCanvas, scale);
    });
});