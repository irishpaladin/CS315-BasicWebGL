/*
 * L4D2.js
 * Demonstrate lighting.
 *
 * Adapted for WebGL by Alex Clarke, 2016.
 */

/* 
    2. Locate the default light settings in the render() function. Is this a positional or directional light? 
    Positional/Point light
    - Directional
    How can you tell?
    - Because the fourth coordianate in the lpos is 0  
    

    3.f Did the mv matrix have an effect both times? Why or why not? Draw a couple diagrams if you need to.</p>
    - Yes but since light position's second coordinate is 1 and eye's second coordinate is 0 then it seems like it doesn't change. 
    
    5. The eye position and the x,y,z coordinates used for E2P3.png, E2P4.png, E2P5.png, and E2P6.png are the same. The only differences are the type of light and application of the mv matrix to switch into World vs View coordinates. Why is the effect so different? Consider which transformations have an effect on vectors vs points in your answer.
    
    6. Draw a diagram to explain the differences between the two types of light as seen from E2P3.png and E2P6.png
     
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
    axes: {points:[], normals:[], start:0, size:0, type: 0},
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

var red = 		 vec4(1.0, 0.0, 0.0, 1.0);
var green = 	 vec4(0.0, 1.0, 0.0, 1.0);
var blue = 		 vec4(0.0, 0.0, 1.0, 1.0);
var lightred =   vec4(1.0, 0.5, 0.5, 1.0);
var lightgreen = vec4(0.5, 1.0, 0.5, 1.0);
var lightblue =  vec4(0.5, 0.5, 1.0, 1.0);
var white = 	 vec4(1.0, 1.0, 1.0, 1.0);
var black =      vec4(0.0, 0.0, 0.0, 1.0);



//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;


//Interaction support variables
var myX, myY, motion = false, animate = true;
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
//----------------------------------------------------------------------------
// makeFlatNormals(triangles, start, num, normals)
// Caculates Flat Normals for Triangles
// Input parameters:
//  - triangles: an array of 4 component points that represent TRIANGLES
//  - start: the index of the first TRIANGLES vertex
//  - num: the number of vertices, as if you were drawing the TRIANGLES
// Output parameters:
//  - normals: an array of vec3's that will represent normals to be used with 
//             triangles
// Preconditions:
//  - the data in triangles should specify triangles in counterclockwise
//    order to indicate their fronts
//  - num must be divisible by 3
//  - triangles and normals must have the types indicated above
// Postconditions:
//  - the normals array will contain unit length vectors from start, 
//    to (start + num)
//----------------------------------------------------------------------------
function makeFlatNormals(triangles, start, num, normals)
{
    if (num % 3 != 0)
    {
        console.log("Warning: number of vertices is not a multiple of 3");
        return;
    }
    for (var i = start; i < start + num; i+= 3)
    {
      var p0 = vec3(triangles[i][0],triangles[i][1],triangles[i][2]);
      var p1 = vec3(triangles[i+1][0],triangles[i+1][1],triangles[i+1][2]);
      var p2 = vec3(triangles[i+2][0],triangles[i+2][1],triangles[i+2][2]);
      var v1 = normalize(vec3(subtract(p0, p1)));
      var v2 = normalize(vec3(subtract(p0, p2)));
        
      var n = normalize(cross(v1,v2));
      normals[i+0] = vec3(n);
      normals[i+1] = vec3(n);
      normals[i+2] = vec3(n);
    }
}
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
    gl.uniform4fv(uColor, white);
    
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
    

    //Set initial view
    var eye = vec3(0.0, 0.0, 10.0);
    //var eye = vec3(10.0, 0.0, 0.0);
    var at =  vec3(0.0, 0.0, 0.0);
    var up =  vec3(0.0, 1.0, 0.0);
    
    mv = lookAt(eye,at,up);
    
    ///////////////////
    //Set up light properties here

    //Defaults:
    
    //Positional light position settings
    //var lpos = vec4(0.0, 0.0, 1.0, 1.0);
    var lpos = vec4(0.0, 1.0, 0.0, 1.0);
    
    //Directional light position settings
    //var lpos = vec4(0.0, 0.0, 1.0, 0.0);
    //var lpos = vec4(0.0, 1.0, 0.0, 0.0);
    
    
    //Diffuse and ambient light color settings
    gl.uniform4fv(light.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    //gl.uniform4fv(light.ambient, vec4(0.2, 0.2, 0.2, 1.0));
    gl.uniform4fv(light.ambient, vec4(0.0, 0.0, 0.0, 1.0)); //light ambient changed to black
    //gl.uniform4fv(light.position,lpos);
    gl.uniform4fv(light.position,mult(mv,lpos));


    ///////////////////
    //Set up material properties here
    //Set cube materials to white
    gl.uniform4fv(material.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    gl.uniform4fv(material.ambient, vec4(0.4, 0.4, 0.4, 1.0));


    var cubeTF = mult(mv, cubeRot);
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(cubeTF)));
    bindBuffersToShader();
    gl.drawArrays(shapes.solidCube.type, shapes.solidCube.start, shapes.solidCube.size);	

    //////////
    //set left sphere materials to red
    var red = vec4(1.0, .02, 0.2, 1.0);
    gl.uniform4fv(material.diffuse, red);
    gl.uniform4fv(material.ambient, mult(vec4(0.5, 0.5, 0.5, 1.0),red));


    var sphereTF = mult(mv, translate(-2,0,0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(sphereTF)));
    urgl.drawSolidSphere(1,50,50);
    
    ///////////
    //set right sphere materials to green
    var green = vec4(0.02, 1, 0.2, 1.0);
    gl.uniform4fv(material.diffuse, green);
    gl.uniform4fv(material.ambient, mult(vec4(0.5, 0.5, 0.5, 1.0),green));


    sphereTF = mult(mv, translate(2,0,0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(sphereTF)));
    urgl.drawSolidSphere(1,50,50);
    
    if (animate == true)
    {
        requestAnimationFrame(render);
        cubeRot = rotateX(rx);
        cubeRot = mult(cubeRot, rotateY(ry));
        rx += .8;
        ry += 2.;
    }
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
        requestAnimationFrame(render);

   }
}

function endDrag(e)
{
   motion = false;
}

function resetCube(e)
{
    //cubeRot = mat4();
    animate = true;
    requestAnimationFrame(render);
}