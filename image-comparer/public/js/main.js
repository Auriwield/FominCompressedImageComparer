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
            var url = window.URL.createObjectURL(file);
            var leftCanvas = $("#left-canvas");
            var ctx = leftCanvas[0].getContext("2d");
            var leftImage = new Image();
            leftImage.src = url;
            ctx.drawImage(leftImage, 0, 0);
        });
});