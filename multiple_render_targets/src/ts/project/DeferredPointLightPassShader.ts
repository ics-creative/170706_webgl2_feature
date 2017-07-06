import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";

/**
 * @author Kentaro Kawakatsu
 */
export class DeferredPointLightPassShader extends ShaderObject
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
    uniform vec3 pointPosition;
    uniform vec4 pointColor;
    uniform float pointIntensity;
    uniform float pointDistance;
    uniform float pointAttenuation;
    out vec4 fragColor;
    
    void main(void)
    {
      vec4 destColor = vec4(0.0);
      vec2 uv = gl_FragCoord.st * screen.xy;
      vec3 pos = texture(texturePosition, uv).xyz;
      vec3 normal = normalize(texture(textureNormal, uv).xyz);
      vec4 color = texture(textureColor, uv);
      
      vec3 lightVector = pointPosition - pos;
      
      float diffuse = clamp(dot(normal, normalize(lightVector)), 0.0, 1.0);
      float attenuation = pow(clamp(1.0 - length(lightVector) / pointDistance, 0.0, 1.0), pointAttenuation);
      vec4 diffuseColor = color * pointColor * vec4(vec3(diffuse * attenuation * pointIntensity), 1.0);
      // diffuseColor = color;
      
      fragColor = diffuseColor;
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

    uniform = new UniformObject(UniformObject.TYPE_VECTOR3, "pointPosition");
    this.uniformList[6] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "pointColor");
    this.uniformList[7] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "pointIntensity");
    this.uniformList[8] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "pointDistance");
    this.uniformList[9] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "pointAttenuation");
    this.uniformList[10] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    this.createProgram();
  }
}
