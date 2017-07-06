import {vec4} from "gl-matrix";
import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";
/**
 * @author Kentaro Kawakatsu
 */
export class PlainColorShader extends ShaderObject
{
  public init():void
  {
    // language=GLSL
    this.vShaderSource = `#version 300 es
    in vec3 position;
    uniform mat4 mvpMatrix;
    uniform vec4 color;
    out float vDepth;
    out vec4 vColor;
    
    void main(void)
    {
      vColor = color;
      gl_Position = mvpMatrix * vec4(position, 1.0);
      vDepth = gl_Position.z / gl_Position.w;
    }
    `;

    // language=GLSL
    this.fShaderSource = `#version 300 es
    precision mediump float;
    
    uniform vec4 screen;
    uniform sampler2D textureDepth;
    in float vDepth;
    in vec4 vColor;
    out vec4 fragColor;
     
    void main(void)
    {
      vec2 uv = gl_FragCoord.st * screen.xy;
      vec4 depth = texture(textureDepth, uv);
      float targetDepth = (depth.r * 2.0) - 1.0;
      vec4 color = vec4(0.0);
      if(targetDepth <= 0.0 || vDepth < targetDepth)
      {
        fragColor = vColor;
      }
      else
      {
        discard;
      }
    }
    `;

    let uniform:UniformObject;
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "mvpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "textureDepth");
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "screen");
    this.uniformList[2] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "color");
    uniform.vector4 = vec4.create();
    this.uniformList[3] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    this.createProgram();
  }
}
