//These variables are all global 
//because they need to be shared between init() and render()

// This variable will store the WebGL rendering context
var gl;

//Uniform Colour Index
var uColor;

// Vertex Array Objects (VAOs)
var smoothArrays, flatArrays;

// Shader Programs
var smoothProgram, flatProgram;

window.onload = function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(.9, .9, .9, 1);
   //gl.enable(gl.DEPTH_TEST); 


   //  Load shaders and initialize attribute buffers
   smoothProgram = initShaders(gl, "smooth-vertex-shader", "fragment-shader");
   flatProgram = initShaders(gl, "flat-vertex-shader", "fragment-shader");

   ///////////////
   ////This stuff goes to the smooth shader for per-vertex colour

   //Allocate a VAO to manage buffer connections to the shader
   smoothArrays = gl.createVertexArray();
   gl.bindVertexArray(smoothArrays);

   //Define the vertex positions you want to draw
   var smoothPoints =
      [
         vec3(0.0, 0.0, -0.5), //Triangle 1
         vec3(0.5, 0.0, -0.5),
         vec3(0.5, 0.5, -0.5),
         vec3(0.0, 1.0, 0.0), //Triangle 2
         vec3(0.0, -1.0, 0.0),
         vec3(1.0, 0.0, 0.0)
      ];
   //and the vertex colours
   var smoothColors =
      [
         vec4(1.0, 0.0, 0.0, 1.0), //Red - Triangle 1
         vec4(0.0, 1.0, 0.0, 1.0), //Green
         vec4(0.0, 0.0, 1.0, 1.0), //Blue
         vec4(1.0, 1.0, 0.0, 1.0), //Yellow - Triangle 2
         vec4(0.0, 1.0, 1.0, 1.0), //Cyan
         vec4(1.0, 0.0, 1.0, 1.0), //Magenta
      ];

   // Load the data into GPU data buffers

   //*** Position buffer **********************
   // Create a buffer for vertex positions, make it active, and copy data to it
   var smoothPositions = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, smoothPositions);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(smoothPoints), gl.STATIC_DRAW);


   // Associate shader attributes with corresponding data buffers
   //Enable the shader's vertex position input and attach the active buffer
   var smoothvPosition = gl.getAttribLocation(smoothProgram, "vPosition");
   gl.enableVertexAttribArray(smoothvPosition);
   gl.vertexAttribPointer(smoothvPosition, 3, gl.FLOAT, gl.FALSE, 0, 0);

   //*** Colour buffer **********************
   // Create a buffer for vertex colours, make it active, and copy data to it
   var colorBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(smoothColors), gl.STATIC_DRAW);

   //Enable the shader's vertex colour input and attach the active buffer
   var vColor = gl.getAttribLocation(smoothProgram, "vColor");
   gl.enableVertexAttribArray(vColor);
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, gl.FALSE, 0, 0);
   ////End of stuff for smooth shader
   ///////////////



   ///////////////
   ////This stuff goes to the flat shader for uniform per-draw colour

   //Allocate a VAO to manage buffer connections to the shader
   flatArrays = gl.createVertexArray();
   gl.bindVertexArray(flatArrays);

   //Define whatever points you want to draw with uniform colours
   var flatPoints = 
      [
         vec2( 0.9,  0.9), //triangle will start at index 0, has 3 points
         vec2( 0.9,  0.0),
         vec2( 0.0,  0.9)
      ];
      
   var circlePoints = circle(30);
   flatPoints = flatPoints.concat(circlePoints); //circle will start at index 3, has 9 points

   // Create a buffer for vertex positions, make it active, and copy data to it
   var flatPositions = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, flatPositions);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(flatPoints), gl.STATIC_DRAW);


   // Associate shader attributes with corresponding data buffers
   //Enable the shader's vertex position input and attach the active buffer
   var flatvPosition = gl.getAttribLocation(flatProgram, "vPosition");
   gl.enableVertexAttribArray(flatvPosition);
   gl.vertexAttribPointer(flatvPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);

   // Get addresses of shader uniforms
   uColor = gl.getUniformLocation(flatProgram, "uColor");
   ////End of stuff for flat shader
   ///////////////

   // Or draw just before the next repaint event
   requestAnimationFrame(render);
};

// Circle function 
//     - input argument: number of sides
//     - output: returns a vec2 array with sides+1 points
//
// Ideas: modify me so I have center and size parameters.
function circle(sides) {
   var vertices = []; // create empty array
   if (sides < 3) {
      console.log("function circle: Not enough sides to make a polygon.");
   }
   else {
      if (sides > 10000) {
         sides = 10000;
         console.log("function circle: Sides limited to 10,000.");
      }
      for (var i = sides; i >= 0; i--) {
         vertices.push(vec2(Math.cos(i / sides * 2 * Math.PI), Math.sin(i / sides * 2 * Math.PI)));
      }
   }
   return vertices;
}


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);

   /////
   // Draw order dependent picture - no depth testing.
   //
   // If you just turn on depth testing, the scene changes slightly because things
   // drawn at the same depth are drawn "first come first serve".
   //
   // You could add a z coordinate to all position arrays and shaders and set z values
   // to avoid switching which shader and VAO we're using.
   /////

   //////
   // draw flat shading with colour uniform
   gl.useProgram(flatProgram);
   gl.bindVertexArray(flatArrays);

   //outline the circle in magenta
   var magenta = vec4(1, 0, 1, 1);
   gl.uniform4fv(uColor, magenta);
   gl.drawArrays(gl.LINE_STRIP, 3, 31);

   //draw circle points in cyan
   gl.uniform4f(uColor, 0, 1, 1, 1);
   gl.drawArrays(gl.POINTS, 3, 31);
   

   //draw triangle in red
   gl.uniform4f(uColor, 1,0,0,1);
   gl.drawArrays(gl.TRIANGLES, 0,3);


   //////
   //draw smooth shading with colour attribute
   gl.useProgram(smoothProgram);
   gl.bindVertexArray(smoothArrays);
   
   gl.drawArrays(gl.TRIANGLES, 3, 6);
   gl.drawArrays(gl.TRIANGLES, 0, 3);

   //////
   // draw more flat shading with colour uniform
   // (I wanted the red triangle in front of everything)
   gl.useProgram(flatProgram);
   gl.bindVertexArray(flatArrays);

   //draw triangle in red
   gl.uniform4f(uColor, 1,0,0,1);
   gl.drawArrays(gl.TRIANGLES, 0,3);
}