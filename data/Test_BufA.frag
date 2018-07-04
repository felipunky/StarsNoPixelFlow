#ifdef GL_ES
precision mediump float;
#endif

#define PROCESSING_COLOR_SHADER

uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform float iGlow;
uniform float iPulse;
uniform int iStars;
uniform sampler2D iChannel0;

// The Universe Within - by Martijn Steinrucken aka BigWings 2018
// Email:countfrolic@gmail.com Twitter:@The_ArtOfCode
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// After listening to an interview with Michael Pollan on the Joe Rogan
// podcast I got interested in mystic experiences that people seem to
// have when using certain psycoactive substances.
//
// For best results, watch fullscreen, with music, in a dark room.
//
// I had an unused 'blockchain effect' lying around and used it as
// a base for this effect. Uncomment the SIMPLE define to see where
// this came from.
//
// Use the mouse to get some 3d parallax.

// Music - Terrence McKenna Mashup - Jason Burruss Remixes
// https://soundcloud.com/jason-burruss-remixes/terrence-mckenna-mashup
//
// YouTube video of this effect:
// https://youtu.be/GAhu4ngQa48
//
// YouTube Tutorial for this effect:
// https://youtu.be/3CycKKJiwis


#define S(a, b, t) smoothstep(a, b, t)

//#define SIMPLE


float N21(vec2 p)
{    // Dave Hoskins - https://www.shadertoy.com/view/4djSRW
    vec3 p3  = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
    return dot(p-ro, rd);
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;
    
    st = fract(st)-.5;
    
    vec2 p[9];
    int i=0;
    for(float y=-1.; y<=1.; y++) {
        for(float x=-1.; x<=1.; x++) {
            p[i++] = GetPos(id, vec2(x,y), t);
        }
    }
    
    float m = 0.;
    float sparkle = 0.;
    
    for(int i=0; i<9; i++) {
        
        float d = length(st-p[i]);
        
        float s = (.005/(d*d));
        s *= S(1., .7, d);
        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.5;
        pulse = pow(pulse, iPulse);
        
        s *= pulse;
        sparkle += s;
    }
    
    
    float sPhase = (sin(t+n)+sin(t*.1))*.05+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;//(*.5+.5);
    
    return m;
}

void main( )
{
    vec2 uv = (gl_FragCoord.xy-iResolution.xy*.5)/iResolution.y;
    vec2 M = iMouse.xy/iResolution.xy-.5;
    
    float t = -iTime*.1;
    
    float s = sin(t);
    float c = cos(t);
    mat2 rot = mat2(c, -s, s, c);
    vec2 st = uv*rot;
    M *= -rot*.1;
    
    float m = 0.;
    for(float i=0.; i<1.; i+=1./iStars) {
        float z = fract(t+i);
        float size = mix(15., 1., z);
        float fade = S(0., .6, z)*S(1., .8, z);
        
        m += fade * NetLayer(st*size-M*z, i, iTime * 0.05);
    }
    
    //float fft  = texelFetch( iChannel2, ivec2(.7,0), 0 ).x;
    vec4 tex = texture( iChannel0, uv );
    float glow = tex.w*iGlow;//+fft*0.05;
    
    vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
    vec3 col = baseCol*m;
    col += baseCol*glow;
    
#ifdef SIMPLE
    uv *= 10.;
    col = vec3(1)*NetLayer(uv, 0., iTime);
    uv = fract(uv);
    //if(uv.x>.98 || uv.y>.98) col += 1.;
#else
    col *= 1.-dot(uv,uv);
    t = mod(iTime, 230.);
    col *= S(0., 20., t)*S(224., 200., t);
#endif
    
    gl_FragColor = vec4(col,1);
}
