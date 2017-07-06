import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";
import {TransformFeedbackVaryingObject} from "./TransformFeedbackVaryingObject";
/**
 * @author Kentaro Kawakatsu
 */
export class TransformFeedbackShader extends ShaderObject
{
  public transformFeedbackVaryingList:TransformFeedbackVaryingObject[];

  public init():void
  {
    // language=GLSL
    this.vShaderSource = `#version 300 es
      #define M_PI ${Math.PI.toFixed(10)}
      
      in float vertexID;
      in vec3 position;
      in vec3 velocityTotal;
      in float birth;
      uniform mat4 mvpMatrix;
      uniform float time;
      uniform vec4 mouse;
    
      out vec4 vColor;
      out vec3 vPosition;
      out vec3 vVelocityTotal;
      out float vBirth;
      
      float random3(vec3 co)
      {
        return fract(sin(dot(co ,vec3(12.9898, 78.233, 56.787))) * 43758.5453);
      }
    
      vec3 interpolate(vec3 t)
      {
        return t * t * t * (vec3(10.0) + t * (6.0 * t - vec3(15.0)));
      }
    
      float grad(vec3 ico, vec3 co)
      {
        float random12 = floor(random3(ico) * 12.0);
        float random3_half = floor(random12 * 0.25) * 0.5;
        float random4 = mod(random12, 4.0);
        float a = 1.0 - mod(random4, 2.0) * 2.0;
        float b = 1.0 - floor(random4 * 0.5) * 2.0;
        vec3 unit = vec3(0.0);
        unit.x = a * floor(random3_half + 0.5);
        unit.y = a * floor(1.0 - random3_half) + b * floor(random3_half);
        unit.z = b * floor(1.5 - random3_half);
        return dot(co - ico, unit);
      }
    
      float perlinNoise(vec3 co)
      {
        co *= (5.0 + cos(time * 0.0001));
        vec3 ico = floor(co);
        vec3 fco = co - ico;
      
        float v000 = grad(ico, co);
        float v100 = grad(ico + vec3(1.0, 0.0, 0.0), co);
        float v010 = grad(ico + vec3(0.0, 1.0, 0.0), co);
        float v110 = grad(ico + vec3(1.0, 1.0, 0.0), co);
        float v001 = grad(ico + vec3(0.0, 0.0, 1.0), co);
        float v101 = grad(ico + vec3(1.0, 0.0, 1.0), co);
        float v011 = grad(ico + vec3(0.0, 1.0, 1.0), co);
        float v111 = grad(ico + vec3(1.0, 1.0, 1.0), co);
      
        vec3 t = interpolate(fco);
      
        float x00 = mix(v000, v100, t.x);
        float x10 = mix(v010, v110, t.x);
        float x01 = mix(v001, v101, t.x);
        float x11 = mix(v011, v111, t.x);
        float y0 = mix(x00, x10, t.y);
        float y1 = mix(x01, x11, t.y);
        return mix(y0, y1, t.z);
      }
    
      vec3 perlinNoise3(vec3 co)
      {
        float sx = perlinNoise(vec3(co));
        float sy = perlinNoise(vec3(co.y - 19.1, co.z + 33.4, co.x + 47.2));
        float sz = perlinNoise(vec3(co.z + 74.2, co.x - 124.5, co.y + 99.4));
        return vec3(sx, sy, sz);
      }
    
      vec3 curlNoise(vec3 co)
      {
        float e = 0.01;
        vec3 dx = vec3(e, 0.0, 0.0);
        vec3 dy = vec3(0.0, e, 0.0);
        vec3 dz = vec3(0.0, 0.0, e);

        vec3 base = perlinNoise3(co);
        vec3 pdx = perlinNoise3(co + dx);
        vec3 pdy = perlinNoise3(co + dy);
        vec3 pdz = perlinNoise3(co + dz);

        float x = pdy.z - base.z - pdz.y + base.y;
        float y = pdz.x - base.x - pdx.z + base.z;
        float z = pdx.y - base.y - pdy.x + base.x;

        return normalize(vec3(x, y, z) * 100.0);
      }
      
      float random(vec2 co)
      {
        return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      vec3 hsv(float h, float s, float v){
        vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
        return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
      }
      
      void main(void)
      {
        vec3 newPosition = position;
        vec3 newVelocityTotal = velocityTotal;
        float newBirth = birth;
        if(time == 0.0 || length(newPosition) > 40.0)
        {
          newBirth = time;
//          newPosition.x = (vertexID / 316.0 / 316.0 - 0.5) * 40.0;
//          newPosition.y = 0.0;
//          newPosition.z = (mod(vertexID, 316.0) / 316.0 - 0.5) * 40.0;
          float theta= vertexID * 0.00001 * M_PI * 2.0;
          newPosition.x = 10.0 * cos(theta);
          newPosition.y = random(vec2(vertexID, time));
          newPosition.z = 10.0 * sin(theta);
          newVelocityTotal = vec3(0.0);
        }

        vec3 velocity = curlNoise(newPosition * vec3(mouse.x, mouse.y, mouse.x)) * vec3(0.5, 0.4, 0.5);
        newVelocityTotal += velocity;

        vVelocityTotal = newVelocityTotal;
        vBirth = newBirth;
        
        vec3 nextPosition = newPosition + velocity;
        vColor = vec4(hsv(length(nextPosition * 0.025) * 0.5 + time * 0.002, 0.8, 0.6), 1.0);
        vPosition = nextPosition;
        gl_Position = mvpMatrix * vec4(nextPosition, 1.0);
        gl_PointSize = 1.0;
      }
    `;

    // language=GLSL
    this.fShaderSource = `#version 300 es
      precision mediump float;
      in vec4 vColor;
      out vec4 outColor;
      
      void main(void)
      {
        outColor = vColor;
      }
    `;

    let uniform:UniformObject;
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "mvpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "time");
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "mouse");
    this.uniformList[2] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("vertexID", 1);
    this.attributeList[0] = attribute;

    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[1] = attribute;

    attribute = new ShaderAttributeObject("velocityTotal", 3);
    this.attributeList[2] = attribute;

    attribute = new ShaderAttributeObject("birth", 1);
    this.attributeList[3] = attribute;

    this.transformFeedbackVaryingList = [];
    let varying:TransformFeedbackVaryingObject;

    varying = new TransformFeedbackVaryingObject("vPosition", 0);
    this.transformFeedbackVaryingList[0] = varying;

    varying = new TransformFeedbackVaryingObject("vVelocityTotal", 1);
    this.transformFeedbackVaryingList[1] = varying;

    varying = new TransformFeedbackVaryingObject("vBirth", 2);
    this.transformFeedbackVaryingList[2] = varying;

    this.createProgram();
  }

  public createProgram():void
  {
    this.vShader = this.creatShader(this.vShaderSource, this.context.VERTEX_SHADER);
    this.fShader = this.creatShader(this.fShaderSource, this.context.FRAGMENT_SHADER);

    this.program = this.context.createProgram();
    this.context.attachShader(this.program, this.vShader);
    this.context.attachShader(this.program, this.fShader);

    let i:number;
    let length:number;
    //
    let varyings:string[] = [];
    length = this.transformFeedbackVaryingList.length;
    for (i = 0; i < length; i++)
    {
      let varying:TransformFeedbackVaryingObject = this.transformFeedbackVaryingList[i];
      varyings[varying.location] = varying.name;
    }
    let context2:WebGL2RenderingContext = <WebGL2RenderingContext> this.context;
    context2.transformFeedbackVaryings(this.program, varyings, context2.SEPARATE_ATTRIBS);
    //

    this.context.linkProgram(this.program);

    length = this.attributeList.length;
    for (i = 0; i < length; i++)
    {
      let attribute:ShaderAttributeObject = this.attributeList[i];
      attribute.location = this.context.getAttribLocation(this.program, attribute.name);
    }

    length = this.uniformList.length;
    for (i = 0; i < length; i++)
    {
      let uniform:UniformObject = this.uniformList[i];
      uniform.location = this.context.getUniformLocation(this.program, uniform.name);
    }
  }
}
