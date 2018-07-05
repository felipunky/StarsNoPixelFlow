import controlP5.*;

PShader bufA, shader;
PImage noise;

// Sliders
ControlP5 Control;

float rotX = 0.0;
float rotY = 0.0;
float Mouse_Rate = 0.6;

float glow = 0.0;
float red_Colour = 0.0;
float green_Colour = 0.0;
float blue_Colour = 0.0;
int number_of_stars = 4;
float pulse = 10.0;
float b_red = 0.0;
float b_green = 0.0;
float b_blue = 0.0;
float density = 0.0;

int procedural = 0;

public void settings() 
{

  size(500, 281, P2D);
  smooth(0);

}

public void setup() {
  
  noise = loadImage("Noise.png");
  textureMode(NORMAL);
  pushMatrix(); 
  scale(1, -1); 
  translate(0, -noise.height);
  //image(noise, 0, 0); 
  textureWrap(Texture.REPEAT);
  popMatrix();
  
  float x = width/height;
  
  Control = new ControlP5( this );  
  
  Control.addSlider( "Mouse_Rate" )
    .setPosition( x, 5 )
    .setRange( 0, 1 );
    
  Control.addSlider( "glow" )
    .setPosition( x, 15 )
    .setRange( 0, 1 );
    
  Control.addSlider( "red_Colour" )
    .setPosition( x, 25 )
    .setRange( 0, 1 )
    ;  
    
  Control.addSlider( "green_Colour" )
    .setPosition( x, 35 )
    .setRange( 0, 1 )
    ;
    
  Control.addSlider( "blue_Colour" )
    .setPosition( x, 45 )
    .setRange( 0, 1 )
    ;
    
  Control.addSlider( "number_of_stars" )
    .setPosition( x, 55 )
    .setRange( 0, 10 )
    .setNumberOfTickMarks(10);
    ;  
    
  Control.addSlider( "pulse" )
    .setPosition( x, 65 )
    .setRange( 0, 50 )
    ;  
    
    Control.addSlider( "b_red" )
    .setPosition( x, 75 )
    .setRange( 0, 1 )
    ;  
    
  Control.addSlider( "b_green" )
    .setPosition( x, 85 )
    .setRange( 0, 1 )
    ;
    
  Control.addSlider( "b_blue" )
    .setPosition( x, 95 )
    .setRange( 0, 1 )
    ; 
    
  Control.addSlider( "density" )
    .setPosition( x, 105 )
    .setRange( 0, 1 )
    ;     
    
  Control.addButton( "procedural" )
    .setValue( 0 )
    .setPosition( x, 115 )
    .setSize( 100, 10 )
    ;  

  bufA = loadShader("data/Test_BufA.frag");
  bufA.set("iResolution", (float)width, (float)height);

  shader = loadShader("data/Test.frag");
  shader.set("iResolution", (float)width, (float)height);
  
}
void draw() 
{
  
  fill(255);
  rect(0, 0, width, height);
  
  bufA.set("iChannel0", get());
  bufA.set("iTime", millis() / 1000.0);
  bufA.set("iFrame", frameCount);
  bufA.set("iMouse", rotX, rotY);
  bufA.set("iGlow", glow);
  bufA.set("iStars", number_of_stars);
  bufA.set("iPulse", pulse);
  
  if( keyPressed )
  {
  
    bufA.set("iTime", 0);
  
  }

  shader(bufA);
  rect(0, 0, width, height);

  //2nd pass
  //resetShader();

  shader.set("iChannel0", get());
  shader.set("iChannel1", noise);
  shader.set("iMouse", rotX, rotY);
  shader.set("iTime", millis() / 1000.0);
  shader.set("iRed", red_Colour);
  shader.set("iGreen", green_Colour);
  shader.set("iBlue", blue_Colour);
  shader.set("iBackGroundRed", b_red);
  shader.set("iBackGroundGreen", b_green);
  shader.set("iBackGroundBlue", b_blue);
  shader.set("iDensity", density);
  shader.set("iProcedural", procedural);
  
  if( keyPressed )
  {
  
    shader.set("iTime", 0);
  
  }
  
  shader(shader);
  rect(0, 0, width, height);
  
  String txt_fps = String.format(getClass().getSimpleName()+ "   [size %d/%d]   [frame %d]   [fps %6.2f]", width, height, frameCount, frameRate);
  surface.setTitle(txt_fps);

}

void mouseDragged() 
{
  
  rotY += (pmouseY-mouseY) * Mouse_Rate;
  rotX += (mouseX-pmouseX) * Mouse_Rate;
  
}

public void keyReleased()
{

  if(key == 's') saveFrame("Nebula.jpg");
 
}

public void procedural() {
  println("The button value is: " + procedural);
  if( procedural == 0.0 )
  {
    
    procedural = 1;
    
  }
  else if( procedural == 1 )
  {
  
    procedural = 0;
  
  }
  
}
