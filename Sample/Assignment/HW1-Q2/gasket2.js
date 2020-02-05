"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 1;

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

function triangle( a, b, c )
{
    points.push( a, b, c );
}



function divideTriangle( a, b, c, count )
{
    

    if(count==0){
        
    }
        triangle( a, b, c );
        //bisect the sides
        var ab1 = mix( a, b, 0.3333333333 );
        var ab2 = mix( a, b, 0.6666666666 );
        // var ab3 = vec2(
        //     (ab1[0]+ab2[0]+(1.7320508076)*(ab1[1]-ab2[1]))/2,
        //     (ab1[1]+ab2[1]+(1.7320508076)*(ab1[0]-ab2[0]))/2);
        var ab3 = calculatePoint(ab1,ab2);
        triangle( ab1, ab2, ab3);
        console.log("ab1: "+ab1);
        console.log("ab2: "+ab2);
        console.log("ab3: "+ab3);
        
        var bc1 = mix( b, c, 0.3333333333 );
        var bc2 = mix( b, c, 0.6666666666 );
        // var bc3 = vec2(
        //     (bc1[0]+bc2[0]+(1.7320508076)*(bc1[1]-bc2[1]))/2,
        //     (bc1[1]+bc2[1]+(1.7320508076)*(bc1[0]-bc2[0]))/2);
        var bc3 = calculatePoint(bc1,bc2);
        triangle( bc1, bc2, bc3);
        console.log("bc1: "+bc1);
        console.log("bc2: "+bc2);
        console.log("bc3: "+bc3);


        var ca1 = mix( c, a, 0.3333333333 );
        var ca2 = mix( c, a, 0.6666666666 );
        // var ac3 = vec2(
        //     (ac1[0]+ac2[0]+(1.7320508076)*(ac1[1]-ac2[1]))/2,
        //     (ac1[1]+ac2[1]+(1.7320508076)*(ac1[0]-ac2[0]))/2);

        var ca3 = calculatePoint(ca1,ca2);
        triangle( ca1, ca2, ca3);
        console.log("ac1: "+ca1);
        console.log("ac2: "+ca2);
        console.log("ac3: "+ca3);


        


        --count;

    //     //three new triangles
    //     divideTriangle( ab1, ab2, ab3, count );
    //     divideTriangle( ac1, ac2, ac3, count );
    //     divideTriangle( bc1, bc2, bc3, count );
    // }
}



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
