
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var partNo = 1;
var theta = [ 45.0, 0.0, 0.0 ];

var thetaLoc;
var partNoLoc;

var Colors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

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

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    partNoLoc = gl.getUniformLocation(program, "partNo"); 

            
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2, Colors[1]);
    quad( 2, 3, 7, 6, Colors[2]);
    quad( 3, 0, 4, 7, Colors[3]);
    quad( 6, 5, 1, 2, Colors[4]);
    quad( 4, 5, 6, 7, Colors[5]);
    quad( 5, 4, 0, 1, Colors[7]);
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

    theta[0] = 90;
    gl.uniform3fv(thetaLoc, theta);

    partNo = 1;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    theta[1] = 120;
    gl.uniform3fv(thetaLoc, theta);

    partNo = 2;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    theta[2] += .5;
    gl.uniform3fv(thetaLoc, theta);

    partNo = 3;
    gl.uniform1i(partNoLoc, partNo);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    requestAnimFrame( render );
}

