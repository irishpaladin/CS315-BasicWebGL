/*
 * L4D2.js
 * Demonstrate lighting.
 *
 * Adapted for WebGL by Alex Clarke, 2016.
 */


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var canvas;

//Collect shape information into neat package
var shapes = {
    wireCube: {points:[], normals:[], start:0, size:0, type: 0},
    solidCube: {points:[], normals:[], start:0, size:0, type: 0},
 };

//Define points for
var cubeVerts = [
                 [ 0.5, 0.5, 0.5, 1], //0
                 [ 0.5, 0.5,-0.5, 1], //1
                 [ 0.5,-0.5, 0.5, 1], //2
                 [ 0.5,-0.5,-0.5, 1], //3
                 [-0.5, 0.5, 0.5, 1], //4
                 [-0.5, 0.5,-0.5, 1], //5
                 [-0.5,-0.5, 0.5, 1], //6
                 [-0.5,-0.5,-0.5, 1], //7
                 ];


//Look up patterns from cubeVerts for different primitive types
//Wire Cube - draw with LINE_STRIP
var wireCubeLookups = [
	0,4,6,2,0, //front
	1,0,2,3,1, //right
	5,1,3,7,5, //back
	4,5,7,6,4, //right
	4,0,1,5,4, //top
	6,7,3,2,6, //bottom
];

//Solid Cube - draw with TRIANGLES, 2 triangles per face
var solidCubeLookups = [
	0,4,6,   0,6,2, //front
	1,0,2,   1,2,3, //right
	5,1,3,   5,3,7,//back
	4,5,7,   4,7,6,//left
	4,0,1,   4,1,5,//top
	6,7,3,   6,3,2,//bottom
];

//Expand Wire Cube data: this wire cube will be white...
for (var i =0; i < wireCubeLookups.length; i++)
{
   shapes.wireCube.points.push(cubeVerts[wireCubeLookups[i]]);
   shapes.wireCube.normals.push(vec3(0,0,1));
}

//Expand Solid Cube data: each face will be a different color so you can see
//    the 3D shape better without lighting.
var left =  vec3(-1,0,0);
var right = vec3(1,0,0);
var down =  vec3(0,-1,0);
var up =    vec3(0,1,0);
var front = vec3(0,0,1);
var back =  vec3(0,0,-1);
var faceNum = 0;
var normalsList = [front, right, back, left, up, down];
for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube.normals.push(normalsList[faceNum]);
   if (i % 6 == 5) faceNum++; //Switch color for every face. 6 vertices/face
}


//Convenience function:
//  - adds shape data to global points array
//  - adds primitive type to a shape
var points = [];
var normals = [];
function loadShape(myShape, type)
{
   myShape.start = points.length;
   points = points.concat(myShape.points);
   normals = normals.concat(myShape.normals);
   myShape.size = myShape.points.length;
   myShape.type = type;
}


//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;


//Interaction support variables
var myX, myY, motion = false, animate = false;
var cubeRot = mat4();

//Variables for Lighting
var light;
var material;
var lighting;
var uColor;

//You will need to rebind these buffers
//and point attributes at them after calling uofrGraphics draw functions
var vertexBuffer, normalBuffer;
var program;


function bindBuffersToShader()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vPosition );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer( program.vNormal, 3, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vNormal );
    
}

//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

window.onload = function init()
{
    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext("webgl2"); // basic webGL2 context
    if (!gl) {
        canvas.parentNode.innerHTML("Cannot get WebGL2 Rendering Context");
    }

    //  Configure WebGL
    //  eg. - set a clear color
    //      - turn on depth testing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "diffuse.vert", "diffuse.frag");
    gl.useProgram(program);
    
    // Set up data to draw
    // Mostly done globally or with urgl in this program...
    loadShape(shapes.wireCube, gl.LINE_STRIP);
    loadShape(shapes.solidCube, gl.TRIANGLES);
    


    // Load the data into GPU data buffers and
    // Associate shader attributes with corresponding data buffers
    //***Vertices***
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
    program.vPosition = gl.getAttribLocation(program, "vPosition");
    
    
    //***Normals***
    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(normals), gl.STATIC_DRAW );
    program.vNormal = gl.getAttribLocation(program, "vNormal");
    
    bindBuffersToShader();
    
    // Get addresses of transformation uniforms
    projLoc = gl.getUniformLocation(program, "p");
    mvLoc = gl.getUniformLocation(program, "mv");
    
    //Set up viewport
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    //Set up projection matrix
    p = perspective(45.0, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p)));
    
    
    // Get  light uniforms
    light = {};   // initialize this light object
    light.diffuse = gl.getUniformLocation(program,"light.diffuse");
    light.ambient = gl.getUniformLocation(program,"light.ambient");
    light.position = gl.getUniformLocation(program,"light.position");
        
   
    // Get material uniforms
    material = {};
    material.diffuse = gl.getUniformLocation(program, "material.diffuse");
    material.ambient = gl.getUniformLocation(program, "material.ambient");
    
    // Get and set other lighting state
    // Enable Lighting
    lighting = gl.getUniformLocation(program, "lighting");
    gl.uniform1i(lighting, 1);

    //Set color to use when lighting is disabled
    uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4f(uColor, 1,1,1,1);
    
    //Set up uofrGraphics
    urgl = new uofrGraphics(gl);
    urgl.connectShader(program, "vPosition", "vNormal", "stub");

    //Set up some mouse interaction
    canvas.onmousedown = startDrag;
    canvas.onmousemove = moveDrag;
    canvas.onmouseup = endDrag;
    canvas.ondblclick = resetCube;

    requestAnimationFrame(render);
};




//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var rx = 0, ry = 0;
function render()
{
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    
    // Set up some default light properties
    gl.uniform4f(light.diffuse, 1,1,1,1);
    gl.uniform4fv(light.ambient, vec4(0.2, 0.2, 0.2, 1.0));
    gl.uniform4fv(light.position,vec4(0.0, 0.0, 1.0, 0.0));

    //Set up some default material properties
    gl.uniform4fv(material.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    gl.uniform4fv(material.ambient, vec4(0.8, 0.8, 0.8, 1.0));

    
    //Set initial view
    var eye = vec3(0.0, 0.0, 10.0);
    var at =  vec3(0.0, 0.0, 0.0);
    var up =  vec3(0.0, 1.0, 0.0);
    
    mv = lookAt(eye,at,up);
    
    //rebind local buffers to shader
    //necessary if uofrGraphics draw functions are used
    bindBuffersToShader();    
        
    //When this exercise is done, this should draw an octahedron
    if (animate == true)
    {
        cubeRot = rotateX(rx);
        cubeRot = mult(cubeRot, rotateY(ry));
        rx += .8;
        ry += 2.;
    }
    var cubeTF = mult(mv, cubeRot);
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(cubeTF)));
    gl.drawArrays(shapes.solidCube.type, shapes.solidCube.start, shapes.solidCube.size);	

    requestAnimationFrame(render);
}


//Mouse motion handlers
function startDrag(e)
{
   myX = e.clientX;
   myY = e.clientY;
   motion = true;
   animate = false;
}

function moveDrag(e)
{
   if(motion)
   {
        var dX = e.clientX - myX;
        var dY = (e.clientY) - myY;
        myX = e.clientX;
        myY = e.clientY;
        var s = 1;
        cubeRot = mult(rotateX(dY*s), cubeRot);
        cubeRot = mult(rotateY(dX*s), cubeRot);
   }
}

function endDrag(e)
{
   motion = false;
}

function resetCube(e)
{
    animate = true;
}