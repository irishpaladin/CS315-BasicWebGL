// This variable will store the WebGL rendering context
var gl;

window.onload = function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(.9,.9,.9,1);

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   //Triangle positions
   var points =
   [
      vec2( 0.9,  0.9),
      vec2( 0.9,  0.0),
      vec2( 0.0,  0.9)
   ];

   // Load the data into GPU data buffers
   var positions = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positions);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

   // Associate shader attributes with corresponding data buffers
   var vPosition = gl.getAttribLocation(program,"vPosition");
   gl.enableVertexAttribArray(vPosition);
   gl.vertexAttribPointer(vPosition,2,gl.FLOAT, gl.FALSE, 0, 0);
   // Get addresses of shader uniforms

   uColor = gl.getUniformLocation(program,"uColor");

   // Either draw as part of initialization
   //render();

   // Or draw just before the next repaint event
   requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);

   //there's come color thing here

   
   // draw
   gl.drawArrays(gl.LINESTRIP,0, 3);
}