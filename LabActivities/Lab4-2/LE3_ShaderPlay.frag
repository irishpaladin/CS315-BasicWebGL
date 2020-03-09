#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
vec3 HEART_COLOR = vec3(1., .05, .05);

float Circle(vec2 uv, vec2 p, float r, float blur){
    float d = length(uv-p);
    float col = smoothstep(r, r-blur , d);

    return col;
}

float s(float a, float b, float t){
    return smoothstep(a, b, t);
}

float smax( float a, float b, float k){
    float h = clamp((b-a)/k+.5, 0., 1.0);

    return mix(a,b,h) + h*(1.-h)*k*.5;
}

float Heart( vec2 uv, float b){
    //circle
    float r = .25;
    b *= r;

    uv.x *=.7;
    uv.y -= smax(sqrt(abs(uv.x))*.5, b, .1);
    uv.y += .1+b*.5;
    float d = length(uv);

    return s(r+b, r-b-.01, d);
}



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    uv-= .5;
    uv.x *=iResolution.x/iResolution.y;

    // cursor position
    vec2 m = iMouse.xy/iResolution.xy;

    // initial color
    vec3 col = vec3(0.);

    float c = Heart(uv, m.y);
    col = vec3(c*HEART_COLOR);


    // Output to screen
    fragColor = vec4(col,1.0);
}




// main - just calls the ShaderToy mainImage to help with code compatibility
void main() 
{ 
    mainImage(fragColor, gl_FragCoord.xy);
}