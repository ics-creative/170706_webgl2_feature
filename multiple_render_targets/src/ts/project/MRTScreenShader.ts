import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";

/**
 * @author Kentaro Kawakatsu
 */
export class MRTScreenShader extends ShaderObject
{
  public init():void
  {
    // language=GLSL
    this.vShaderSource = `#version 300 es
    in vec3 position;
    uniform mat4 mvpMatrix;
    
    void main(void)
    {
      gl_Position = mvpMatrix * vec4(position, 1.0);
    }
    `;

    // language=GLSL
    this.fShaderSource = `#version 300 es
    precision mediump float;
    
    uniform vec4 screen;
    uniform sampler2D texturePosition;
    uniform sampler2D textureNormal;
    uniform sampler2D textureColor;
    uniform sampler2D textureDepth;
    out vec4 fragColor;
    
    void main(void)
    {
      vec4 destColor = vec4(0.0);
      vec2 uv = gl_FragCoord.st * screen.xy * vec2(2.0, 2.0);
      
      if(uv.x < 1.0 && uv.y >= 1.0)
      {
        vec3 pos = texture(texturePosition, uv + vec2(0.0, -1.0)).xyz;
        pos = (pos + vec3(4.0)) / 8.0;
        destColor += vec4(pos, 1.0);
      }
      
      if(uv.x >= 1.0 && uv.y >= 1.0)
      {
        vec3 normal = texture(textureNormal, uv + vec2(-1.0, -1.0)).xyz;
        normal = (normal + vec3(1.0)) / 2.0;
        destColor += vec4(normal, 1.0);
      }
      
      if(uv.x < 1.0 && uv.y < 1.0)
      {
        destColor += texture(textureColor, uv);
      }
      
      if(uv.x >= 1.0 && uv.y < 1.0)
      {
        destColor += texture(textureDepth, uv + vec2(-1.0, 0.0));
      }
      
      fragColor = destColor;
    }
    `;

    let uniform:UniformObject;
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "mvpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "texturePosition");
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "textureNormal");
    this.uniformList[2] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "textureColor");
    this.uniformList[3] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "textureDepth");
    this.uniformList[4] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "screen");
    this.uniformList[5] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    this.createProgram();
  }
}
