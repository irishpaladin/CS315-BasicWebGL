// This variable will store the WebGL rendering context
var gl;
var uColor;
var triangles, circles;
var program, program2;

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
   program = initShaders(gl, "smooth-vertex-shader", "fragment-shader");
   program2 = initShaders(gl, "vertex-shader", "fragment-shader"); //CIRCLE

   gl.useProgram(program2);

   // Set up data to draw
   //Triangle positions
   var points=
[
   vec3( 0.0, 0.0,-0.5 ),
];

   //---TRIANGLE----
   // Load the data into GPU data buffers
   var positions = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positions);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


   triangles= gl.createVertexArray();
   gl.bindVertexArray(triangles);

   // Associate shader attributes with corresponding data buffers
   var vPosition = gl.getAttribLocation(program,"vPosition");
   gl.enableVertexAttribArray(vPosition);
   gl.vertexAttribPointer(vPosition,2,gl.FLOAT, gl.FALSE, 0, 0);
   

   ////---CIRCLE----
   circles = gl.createVertexArray();
   gl.bindVertexArray(circles);
   // Load the data into GPU data buffers
   var circlePoints = circle(0);
   var cPositions = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, cPositions);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(circlePoints),gl.STATIC_DRAW);
   // Associate shader attributes with corresponding data buffers
   var cvPosition = gl.getAttribLocation(program2,"vPosition");
   gl.enableVertexAttribArray(cvPosition);
   gl.vertexAttribPointer(cvPosition,2,gl.FLOAT, gl.FALSE, 0, 0);

   
   // Get addresses of shader uniforms
   uColor = gl.getUniformLocation(program2,"uColor");

   // Either draw as part of initialization
   //render();

   // Or draw just before the next repaint event
   requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);

   //drawinf circles
   gl.useProgram(program2);
   gl.bindVertexArray(circles);
   gl.uniform4f(uColor,0,1,1,1);
   gl.drawArrays(gl.points,0, 8);

   //drawing triangles
   gl.useProgram(program);
   gl.bindVertexArray(triangles);
   var magenta = vec4(1,0,1,1);
   gl.uniform4fv(uColor, magenta);
   gl.drawArrays(gl.TRIANGLES,0, 3);
}