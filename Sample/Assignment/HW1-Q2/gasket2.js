"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -.5, -.5 ),
        vec2(  0,  .5 ),
        vec2(  .5, -.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                   NumTimesToSubdivide);
    // snowflake( vertices[0], vertices[1], vertices[2],
    //     NumTimesToSubdivide);                

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

//function that creates triangle
function triangle( a, b, c )
{
    points.push( a, b, c );
}

// recursive function for koch snowflake
function divideTriangle( a, b, c, count )
{
    if(count==0){
        triangle( a, b, c );
    }else{
        --count;
        triangle( a, b, c );
        
        //triangle in the main sides
        var ab1 = mix( a, b, 1/3 );
        var ab2 = mix( a, b, 2/3 );
        var ab3 = calculatePoint(ab1,ab2);
        divideTriangle( ab1, ab3, ab2, count );

        var bc1 = mix( b, c, 1/3 );
        var bc2 = mix( b, c, 2/3 );
        var bc3 = calculatePoint(bc1,bc2);
        divideTriangle( bc1, bc3, bc2, count );
        
        var ca1 = mix( c, a, 1/3 );
        var ca2 = mix( c, a, 2/3 );
        var ca3 = calculatePoint(ca1,ca2);
        divideTriangle( ca1, ca3, ca2, count ); 

        //triangle in the secondary sides
        divideTriangle( ab2, b, bc1, count );
        divideTriangle( bc2, c, ca1, count );
        divideTriangle( ca2, a, ab1, count );
    }
}


//function that calculate the unknow vertice
function calculatePoint(center, p)
{
    var angleInDegrees = 60;
    var angleInRadians = angleInDegrees * Math.PI / 180;
    var s1 = Math.sin(angleInRadians);
    var c1 = Math.cos(angleInRadians);
    var x1 = (p[0] - center[0]) * c1 - (p[1] - center[1])* s1 + center[0];
    var y1 = (p[0] - center[0]) * s1 + (p[1] - center[1])* c1 + center[1];
    var f = vec2(x1,y1);
    return f;
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
