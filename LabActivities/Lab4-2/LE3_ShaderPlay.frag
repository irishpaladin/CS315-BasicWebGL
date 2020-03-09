#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

float Circle(vec2 uv, vec2 p, float r, float blur){
    float d = length(uv-p);
    float col = smoothstep(r, r-blur , d);

    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    uv-= .5;
    uv.x *=iResolution.x/iResolution.y;

    vec3 col = vec3(0.);


    // Output to screen
    fragColor = vec4(col,1.0);
}




// main - just calls the ShaderToy mainImage to help with code compatibility
void main() 
{ 
    mainImage(fragColor, gl_FragCoord.xy);
}