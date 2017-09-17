function onSelectOrDragImage() {
    return new window.Promise(function (resolve, reject) {
        $(".drop-zone:first")
            .on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).addClass('dragging');
            })
            .on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).removeClass('dragging');
            })
            .on("drop", function (event) {
                event.preventDefault();
                event.stopPropagation();
                var file = event.originalEvent.dataTransfer.files[0];
                resolve(file);
            });

        var input = $("input#fake-button");

        input.on("change", function (event) {
            var file = event.delegateTarget.files[0];
            resolve(file);
        });

        $(".drop-zone .btn").click(function () {
            input.click();
        });
    });
}

$(document).ready(function () {
    onSelectOrDragImage()
        .then(function (file) {
            var dropZone = $(".drop-zone:first");
            var workZone = $(".work-zone:first");
            dropZone.addClass("hidden");
            workZone.removeClass("hidden");

            return getImageData(file);
        })
        .then(function (imageData) {
            drawCanvas(imageData);
            $(window).resize(function () {
                drawCanvas(imageData);
            });
        });
});

function drawCanvas(imageData) {
    var leftCanvas = $("#left-canvas");
    var ctx = leftCanvas[0].getContext("2d");
    var scale = calcScale(imageData);
    leftCanvas[0].width = imageData.width * scale;
    leftCanvas[0].height = imageData.height * scale;
    imageData = scaleImageData(imageData, scale);
    ctx.putImageData(imageData, 0, 0);
}

function calcScale(imageData) {
    var maxWidth = $(window).width() / 2 * 0.9;
    var maxHeight = ($(window).height() - $(".header").height()) * 0.9;
    var mpX = maxWidth / imageData.width;
    var mpY = maxHeight / imageData.height;
    return Math.min(mpX, mpY);
}

function scaleImageData(imageData, scale) {
    var h1 = imageData.height;
    var w1 = imageData.width;
    var w2 = Math.floor(w1 * scale);
    var h2 = Math.floor(h1 * scale);

    var srcLength = h1 * w1 * 4;
    var destLength = w2 * h2 * 4;

    var src = imageData.data;
    var dest = new Uint8ClampedArray(destLength);

    for (var y = 0; y < h2; y++)
    {
        for (var x = 0; x < w2; x++)
        {
            var x1 = Math.floor(x / scale);
            var y1 = Math.floor(y / scale);

            if (x1 < 0 || x1 >= w1 || y1 < 0 || y1 >= h1)
                continue;

            if (x < 0 || x >= w2 || y < 0 || y >= h2)
                continue;

            var destIndex = (y * w2 + x) * 4;
            var sourceIndex = (y1 * w1 + x1) * 4;

            if (destIndex + 3 >= destLength || destIndex < 0
                || sourceIndex + 3 >= srcLength || sourceIndex < 0) continue;

            for (var i = 0; i < 4; i++)
            {
                dest[destIndex + i] = src[sourceIndex + i];
            }
        }
    }

    return new ImageData(dest, w2, h2);
}

function getImageData(file) {
    var url = window.URL.createObjectURL(file);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var image = new Image();
    var promise = new window.Promise(function (resolve) {
        image.onload = function () {
            ctx.drawImage(image, 0, 0);
            resolve(ctx.getImageData(0, 0, image.width, image.height));
        };
    });
    image.src = url;
    return promise;
}