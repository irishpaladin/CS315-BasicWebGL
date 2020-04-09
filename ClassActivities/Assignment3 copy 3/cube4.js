
var canvas;
var gl;

var NumVertices  = 36;
var index = 0;
var points = [];
var colors = [];

var partNo = 1;
var mv = new mat4();

var partNoLoc;
var mvLoc;


var near = -1;
var far = 4;
var radius = 1;
var theta  = 0.7;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var counter =-1.0;
var part2 = false;

var Colors = [
        [ 0.5, 0.5, 0.5, 1.0 ],  // black
        [ 0.3, 0.3, 0.3, 1.0 ],  // red
        [ 0.2, 0.2, 0.2, 1.0 ],  // yellow
        [ 0.4, 0.4, 0.4, 1.0 ],  // green
        [ 0.35, 0.35, 0.35, 1.0 ],  // blue
        [ 0.25, 0.25, 0.25, 1.0 ],  // magenta
        [ 0.45, 0.45, 0.45, 1.0 ],  // white
        [ 1.0, 0.8, 0.8, 1.0 ]   // cyan
];

var Primitives = [
    [ 0.01, 0.01, 0.01, 1.0 ],  // black
    [ 1.0, 0.01, 0.01, 1.0 ],  // red
    [ 1.0, 1.0, 0.01, 1.0 ],  // yellow
    [ 0.01, 1.0, 0.01, 1.0 ],  // green
    [ 0.01, 0.01, 1.0, 1.0 ],  // blue
    [ 1.0, 0.01, 1.0, 1.0 ],  // magenta
    [ 1.0, 1.0, 1.0, 1.0 ],  // white
    [ 0.01, 1.0, 1.0, 1.0 ]   // cyan
];

function multColor(clr1, clr2){
    return vec4(clr1[0]*clr2[0], 
        clr1[1]*clr2[1],
        clr1[2]*clr2[2],
        clr1[3]*clr2[3]);
}


function triangle(a, b, c) {
    
    points.push(a);
    colors.push(Colors[7]);
    points.push(b);  
    colors.push(Colors[7]);    
    points.push(c);
    colors.push(Colors[7]);

    index += 3;
}


function divideTriangle(a, b, c, count) {
   if ( count > 0 ) {
               
       var ab = mix( a, b, 0.5);
       var ac = mix( a, c, 0.5);
       var bc = mix( b, c, 0.5);
                              
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

       divideTriangle( a, ab, ac, count - 1 );
       divideTriangle( ab, b, bc, count - 1 );
       divideTriangle( bc, c, ac, count - 1 );
       divideTriangle( ab, bc, ac, count - 1 );
   }
   else { 
       triangle( a, b, c );
   }
}


function tetrahedron(a, b, c, d, n) {
   divideTriangle(a, b, c, n);
   divideTriangle(d, c, b, n);
   divideTriangle(a, d, b, n);
   divideTriangle(a, c, d, n);
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    tetrahedron(va, vb, vc, vd, 5);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    partNoLoc = gl.getUniformLocation(program, "partNo"); 

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

        
    document.getElementById("toggle").addEventListener("click", function(){
        counter =-1.0;
        theta  = 0.7;
        phi    = 0.0;
        if(part2){
            part2 = false;
        }else{
            part2 = true;
        }
      });   
    render();
}



function colorCube()
{
    quad( 1, 0, 3, 2, Colors[0]);
    quad( 2, 3, 7, 6, Colors[0]);
    quad( 3, 0, 4, 7, Colors[0]);
    quad( 6, 5, 1, 2, Colors[0]);
    quad( 4, 5, 6, 7, Colors[0]);
    quad( 5, 4, 0, 1, Colors[0]);
    quad( 1, 0, 3, 2, multColor(Colors[1],Primitives[1]));
    quad( 2, 3, 7, 6, multColor(Colors[2],Primitives[1]));
    quad( 3, 0, 4, 7, multColor(Colors[3],Primitives[1]));
    quad( 6, 5, 1, 2, multColor(Colors[4],Primitives[1]));
    quad( 4, 5, 6, 7, multColor(Colors[5],Primitives[1]));
    quad( 5, 4, 0, 1, multColor(Colors[6],Primitives[1]));
    quad( 1, 0, 3, 2, multColor(Colors[1],Primitives[2]));
    quad( 2, 3, 7, 6, multColor(Colors[2],Primitives[2]));
    quad( 3, 0, 4, 7, multColor(Colors[3],Primitives[2]));
    quad( 6, 5, 1, 2, multColor(Colors[4],Primitives[2]));
    quad( 4, 5, 6, 7, multColor(Colors[5],Primitives[2]));
    quad( 5, 4, 0, 1, multColor(Colors[6],Primitives[2]));
    quad( 1, 0, 3, 2, multColor(Colors[1],Primitives[3]));
    quad( 2, 3, 7, 6, multColor(Colors[2],Primitives[3]));
    quad( 3, 0, 4, 7, multColor(Colors[3],Primitives[3]));
    quad( 6, 5, 1, 2, multColor(Colors[4],Primitives[3]));
    quad( 4, 5, 6, 7, multColor(Colors[5],Primitives[3]));
    quad( 5, 4, 0, 1, multColor(Colors[6],Primitives[3]));
    quad( 1, 0, 3, 2, multColor(Colors[1],Primitives[4]));
    quad( 2, 3, 7, 6, multColor(Colors[2],Primitives[4]));
    quad( 3, 0, 4, 7, multColor(Colors[3],Primitives[4]));
    quad( 6, 5, 1, 2, multColor(Colors[4],Primitives[4]));
    quad( 4, 5, 6, 7, multColor(Colors[5],Primitives[4]));
    quad( 5, 4, 0, 1, multColor(Colors[6],Primitives[4]));
}

function quad(a, b, c, d, color) 
{
    var vertices = [
        vec3( -0.5,  0.0,  0.5 ),
        vec3( -0.5,  1.0,  0.5 ),
        vec3(  0.5,  1.0,  0.5 ),
        vec3(  0.5,  0.0,  0.5 ),
        vec3( -0.5,  0.0, -0.5 ),
        vec3( -0.5,  1.0, -0.5 ),
        vec3(  0.5,  1.0, -0.5 ),
        vec3(  0.5,  0.0, -0.5 )
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( color );
    }
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(part2){
        eye = vec3((radius*Math.sin(phi)), radius*Math.sin(theta), radius*Math.cos(phi));
    
        if(theta > 0.05) {
            phi = phi + 0.01;
            theta = theta-0.002;
        }
    }else{
        theta = 0.2;
        eye = vec3((radius*Math.sin(phi)) + counter, radius*Math.sin(theta), radius);  
        if(counter<= 1)counter+=0.01;
    }

    

    //console.log("eyeY:" + radius*Math.sin(theta));
             
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );



    partNo = 1;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    

    partNo = 2;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 36, NumVertices );

    partNo = 3;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 72, NumVertices );

    partNo = 4;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 108, NumVertices );

    partNo = 5;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 144, NumVertices );

    partNo = 6;
    gl.uniform1i(partNoLoc, partNo);
    for( var i=180; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    
    requestAnimFrame( render );
}

