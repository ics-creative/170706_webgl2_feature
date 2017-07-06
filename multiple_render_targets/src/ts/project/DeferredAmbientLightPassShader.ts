import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";

/**
 * @author Kentaro Kawakatsu
 */
export class DeferredAmbientLightPassShader extends ShaderObject
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
    uniform sampler2D textureColor;
    uniform vec4 ambientColor;
    uniform float ambientIntensity;
    out vec4 fragColor;
    
    void main(void)
    {
      vec2 uv = gl_FragCoord.st * screen.xy;
      vec4 color = texture(textureColor, uv);
      
      fragColor = color * clamp(ambientColor * vec4(vec3(ambientIntensity), 1.0), 0.0, 1.0);
    }
    `;

    let uniform:UniformObject;
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "mvpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_TEXTURE, "textureColor");
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "screen");
    this.uniformList[2] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "ambientColor");
    this.uniformList[3] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "ambientIntensity");
    this.uniformList[4] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    this.createProgram();
  }
}
