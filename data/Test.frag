#ifdef GL_ES
precision mediump float;
#endif

#define PROCESSING_COLOR_SHADER

uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform float iZoom;
uniform float iRed;
uniform float iGreen;
uniform float iBlue;
uniform float iDensity;
uniform int iNumberOfArms;
uniform int iProcedural;
uniform int iGalaxy;
uniform int iFractal;
uniform float iBackGroundRed;
uniform float iBackGroundGreen;
uniform float iBackGroundBlue;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define STEPS       128
#define FAR         10.
#define PI acos( -1.0 )
#define TPI    PI * 2.0
#define HASHSCALE .1031

mat2 rot( float a )
{
    
    return mat2( cos( a ), -sin( a ),
                sin( a ),  cos( a )
                );
    
}

/*
 float hash( float n )
 {
 
 return fract( sin( n ) * 45843.349 );
 
 }
 */

// https://www.shadertoy.com/view/4djSRW

float hash(float p)
{
    vec3 p3  = fract(vec3(p) * HASHSCALE);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

// iq's
float noise( in vec3 x )
{
    
    float res = 0.0;
    
    if( iProcedural == 0 )
    {
    
        vec3 p = floor( x );
        vec3 k = fract( x );
        
        k *= k * k * ( 3.0 - 2.0 * k );
        
        float n = p.x + p.y * 57.0 + p.z * 113.0;
        
        float a = hash( n );
        float b = hash( n + 1.0 );
        float c = hash( n + 57.0 );
        float d = hash( n + 58.0 );
        
        float e = hash( n + 113.0 );
        float f = hash( n + 114.0 );
        float g = hash( n + 170.0 );
        float h = hash( n + 171.0 );
        
        res = mix( mix( mix ( a, b, k.x ), mix( c, d, k.x ), k.y ),
                        mix( mix ( e, f, k.x ), mix( g, h, k.x ), k.y ),
                        k.z
                        );
    
    }
    else if( iProcedural == 1 )
    {
        
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
        
        vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
        vec2 rg = textureLod( iChannel1, (uv+ 0.5)/256.0, 0.0 ).yx;
        res = mix( rg.x, rg.y, f.z );
        
    }
        
    return res;
    
}

float fbm( in vec3 p )
{
    
    if( iGalaxy == 0 )
    {
        
        p.xy *= rot( iTime );
        
    }
    
    float f = 0.0;
    f += 0.5000 * noise( p ); p *= 2.02;
    f += 0.2500 * noise( p ); p *= 2.03;
    f += 0.1250 * noise( p ); p *= 2.01;
    f += 0.0625 * noise( p );
    f += 0.0125 * noise( p );
    return f / 0.9375;
    
}

// iapafoto's modded spiral
float spiral( in vec3 p )
{
    
    float a = atan(p.y,p.x)+iTime;
    float r = length(p.xy);
    float lr = 2.0 * log(r);
    float th = 0.05 - 0.4 * r; // thickness according to distance
    float d = fract( 0.5 * ( a - lr * 1.0 ) / PI ); //apply rotation and scaling.
    float phase = float( iNumberOfArms ) * ( a - lr );
    
    d = cos( phase );
    
    d = ( 0.1 - abs( d - 0.1 ) ) * 2.0 * PI * r / 32.0;
    
    return sqrt( d * d + p.z * p.z ) - th * r;
    
}

float map( vec3 p )
{
    
    if( iFractal == 0 )
    {
        
        for( float i = 0.; i < 0.5; i+=0.1 )
        {
            
            p = abs( p - vec3( 0.1 ) ) - 0.1;
            p.xy *= rot( iTime * 0.05 );
            p.xz *= rot( iTime * 0.05 );
            p.zy *= rot( iTime * 0.05 );
            
        }
        
    }
    
    float fO = ( 1.5 + iDensity ) - spiral( p ) + fbm( p ) * 0.3;
    
    float f = fbm( p );
    
    return mix( fO, f, iGalaxy );
    
}

float ray( vec3 ro, vec3 rd, out float den )
{
    
    float t = 0.0, maxD = 0.0, d = 1.0; den = 0.0;
    
    for( int i = 0; i < STEPS; ++i )
    {
        
        vec3 p = ro + rd * t;
        
        if( iGalaxy == 1 )
        {
        
            den = d * ( map( p ) * t * t * 0.025 );
        
        }
        
        if( iGalaxy == 0 )
        {
            
            den = 0.3 * map( p );
            
        }
        
        maxD = maxD < den ? den : maxD;
        
        if( maxD > 1.0 || t > FAR ) break;
        
        // https://www.shadertoy.com/view/MscXRH
        //t += max( maxD*.1, .05 );
        
        t += 0.05;
        
    }
    
    den = maxD;
    
    return t;
    
}

vec3 shad( vec3 ro, vec3 rd, vec2 uv )
{
    
    float den = 0.0;
    float t = ray( ro, rd, den );
    vec3 col = vec3( 0 );
    vec3 bac = vec3( iBackGroundRed, iBackGroundGreen, iBackGroundBlue );
    vec3 f = vec3( 0 );
    
    vec3 p = ro + rd * t;
    
    if( iGalaxy == 1 )
    {
    
        den += iDensity;
        
        f = mix( vec3( 0.4 + iRed, fbm( p ) + iGreen, 0.2 + iBlue ),
                 vec3( 0.9, 0.9 + iGreen, 0.5 + iBlue ),
                 fbm( p )
                );
        
        col = mix( bac, f, den );
        
    }
    
    else if( iGalaxy == 0 )
    {
        
        col = mix( bac,
                   mix( vec3( 0.4 + iRed, 0.1 + iGreen, 0.2 + iBlue ),
                        vec3( 0.9 + iRed, 0.9 + iGreen, 0.5 + iBlue ),
                        den ),
                   den * 4.0 + iDensity );
        
    }
    
    col *= sqrt( col );
    
    return col;
    
}

void main( )
{
    
    vec2 uv = ( -iResolution.xy + 2.0 * gl_FragCoord.xy ) / iResolution.y;
    vec2 p = gl_FragCoord.xy / iResolution.xy;
    
    vec2 mou = iMouse.xy / iResolution.xy;
    
    vec3 ro = vec3( 0 );
    vec3 rd = vec3( 0 );
    
    if( iGalaxy == 1 )
    {
        
        ro = vec3( mou.x, mou.y, 2.5 - iZoom );
        rd = normalize( vec3( uv, -1.0 ) );
        ro.zy *= rot( -iTime * 0.1 );
        rd.zy *= rot( -iTime * 0.1 );
        ro.xy *= rot( -iTime * 0.1 );
        rd.xy *= rot( -iTime * 0.1 );
    
    }
    
    if( iGalaxy == 0 )
    {
        
        ro = vec3( 0, 0, 2.5 - iZoom );
        rd = normalize( vec3( uv, -1.0 ) );
        ro.zy *= rot( mou.y * TPI );
        rd.zy *= rot( mou.y * TPI );
        ro.xy *= rot( mou.x * TPI );
        rd.xy *= rot( mou.x * TPI );
        
    }
        
    float den = 0.0, t = ray( ro, rd, den );
    
    vec3 poi = ro + rd * t;
    
    vec3 col = shad( ro, rd, uv );
    
    vec3 sta = texture( iChannel0, p ).rgb;
    
    sta += 0.4 * col;
    
    // Output to screen
    gl_FragColor = vec4( sta, den );
}
