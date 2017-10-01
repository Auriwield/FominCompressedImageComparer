$("nav li a[href='#color-model']").first().parent().click(function () {

    if (!imageData.left) return;

    const canvas = $("#3d-color-canvas");

    canvasUtils.makeCanvasSquare(canvas);

    const gl = canvas[0].getContext("webgl");

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
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
    const shaderProgram = glUtils.initShaderProgram(gl, vsSource, fsSource);

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

    let then = 0;
    var cubeRotation = 0.0;
    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        glUtils.drawScene(gl, programInfo, buffers, cubeRotation);
        cubeRotation += deltaTime;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


    /*    $(window).resize(function () {
            let scale = canvasUtils.calcScale(diffImageData, 1);
            let canvas = $("#diff-canvas");
            canvasUtils.drawIntoCanvas(diffImageData, canvas, scale);
        });*/

    function initBuffers(gl) {

        // Create a buffer for the cube's vertex positions.

        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the cube.

        const positions = [];


        l:for (let i = 0; i < imageData.left.data.length; i += 4) {
            let r = imageData[i] / 255;
            let g = imageData[i] / 255;
            let b = imageData[i] / 255;

            for (let j = 0; j < positions.length; j += 3) {
                if (positions[j] !== r) continue l;
                if (positions[j + 1] !== g) continue l;
                if (positions[j + 2] !== b) continue l;
            }

            positions.push(r);
            positions.push(g);
            positions.push(b);
        }

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Now set up the colors for the faces. We'll use solid colors
        // for each face.

        const colors = [];
        for (let i = 0; i < positions.length; i += 3) {
            let color = [positions[i], positions[i + 1], positions[i + 2], 1];
            colors.push(color);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's positions.

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        return {
            position: positionBuffer,
            color: colorBuffer
        };
    }
});

