$("nav li a[href='#color-model']").first().parent().click(function () {

    if (!imageData.left) return;

    const canvas = $("#3d-color-canvas");

    canvasUtils.makeCanvasSquare(canvas);

    let gl = canvas[0].getContext("webgl");

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      gl_PointSize = 1.0;
      vColor = aVertexColor;
    }
  `;

    const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    let rotateMatrix = mat4.create();
    let scale = 1;

    // Draw the scene repeatedly
    function render() {
        drawScene(gl, programInfo, buffers, mat4.clone(rotateMatrix), [scale, scale, scale]);
        //requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    function onMouseDown(dx, dy) {
        let radX = -dx * Math.PI / 180;
        let radY = -dy * Math.PI / 180;

        let sensitivity = 0.5;

        radX *= sensitivity;
        radY *= sensitivity;

        mat4.rotate(rotateMatrix,   // destination matrix
            rotateMatrix,           // matrix to rotate
            radY,                   // amount to rotate in radians
            [1, 0, 0]);             // axis to rotate around (Z)

        mat4.rotate(rotateMatrix,   // destination matrix
            rotateMatrix,           // matrix to rotate
            radX,                   // amount to rotate in radians
            [0, 1, 0]);             // axis to rotate around (Z)

        requestAnimationFrame(render);
    }

    function onScroll(delta) {
        scale += delta / 3000;
        requestAnimationFrame(render);
    }

    canvasUtils.onMouseDown(canvas, onMouseDown);
    canvasUtils.onScroll(canvas, onScroll);

    /*$(window).resize(function () {
        canvasUtils.makeCanvasSquare(canvas);
        requestAnimationFrame(render);
    });*/

    function initBuffers(gl) {

        // Create a buffer for the cube's vertex positions.

        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the cube.

        const pixels = [];


        for (let i = 0; i < imageData.left.data.length; i += 4) {
            let r = imageData.left.data[i] / 255;
            let g = imageData.left.data[i + 1] / 255;
            let b = imageData.left.data[i + 2] / 255;

            /*
                        for (let j = 0; j < positions.length; j += 3) {
                            if (positions[j] === r
                                && positions[j + 1] === g
                                && positions[j + 2] === b)
                                continue l;
                        }
            */

            pixels.push(r);
            pixels.push(g);
            pixels.push(b);
        }

        const positions = [];

        for (let i = 0; i < pixels.length; i++) {
            positions[i] = pixels[i] * 2 - 1;
        }

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Now set up the colors for the faces. We'll use solid colors
        // for each face.

        const colors = [];
        for (let i = 0; i < pixels.length; i += 3) {
            colors.push(pixels[i]);
            colors.push(pixels[i + 1]);
            colors.push(pixels[i + 2]);
            colors.push(1);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        return {
            position: {"buffer": positionBuffer, "length": pixels.length},
            color: {"buffer": colorBuffer, "length": colors.length}
        };
    }

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = glUtils.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = glUtils.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    function drawScene(gl, programInfo, buffers, rotateMatrix, scaleVector) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        mat4.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, -6.0]);  // amount to translate

        mat4.transpose(rotateMatrix, rotateMatrix);
        mat4.multiply(modelViewMatrix, modelViewMatrix, rotateMatrix);
        mat4.scale(modelViewMatrix, modelViewMatrix, scaleVector);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position.buffer);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color.buffer);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexColor);
        }

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const vertexCount = buffers.position.length / 3;
            gl.drawArrays(gl.POINTS, 0, vertexCount);
        }
    }
});

