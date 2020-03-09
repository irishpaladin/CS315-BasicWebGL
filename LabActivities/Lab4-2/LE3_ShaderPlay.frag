#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // Time varying pixel color
    //vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    uv-= .5;
    uv.x *=iResolution.x/iResolution.y;

    float d = length(uv);
    float r = 0.3;

    float col = smoothstep(r, r-0.02 , d);

    // Output to screen
    fragColor = vec4(vec3(col),1.0);
}




// main - just calls the ShaderToy mainImage to help with code compatibility
void main() 
{ 
    mainImage(fragColor, gl_FragCoord.xy);
}