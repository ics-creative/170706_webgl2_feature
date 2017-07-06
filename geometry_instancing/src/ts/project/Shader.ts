import {vec3, vec4} from "gl-matrix";
import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";
/**
 * @author Kentaro Kawakatsu
 */
export class Shader extends ShaderObject
{
  public init():void
  {
    // language=GLSL
    this.vShaderSource = `#version 300 es
      in vec3 position;
      in vec3 normal;
      in mat4 instanceMMatrix;
      in vec4 instanceColor;
      uniform mat4 vpMatrix;
      uniform vec4 ambientColor;
      uniform vec3 lightDirection;
      uniform vec4 lightColor;
      uniform float lightIntensity;
    
      out vec4 vColor;
      
      void main(void)
      {
        vec3 worldNormal = normalize(instanceMMatrix * vec4(normal, 0.0)).xyz;
        float diffuse = clamp(dot(worldNormal, lightDirection), 0.0, 1.0);
        vColor = instanceColor * clamp(ambientColor + lightColor * vec4(vec3(lightIntensity * diffuse), 1.0), 0.0, 1.0);
        gl_Position = (vpMatrix * instanceMMatrix) * vec4(position, 1.0);
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
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "vpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "ambientColor");
    uniform.vector4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR3, "lightDirection");
    uniform.vector3 = vec3.fromValues(1.0, 0.0, 0.0);
    this.uniformList[2] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "lightColor");
    uniform.vector4 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.uniformList[3] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VALUE, "lightIntensity");
    uniform.value = 1.0;
    this.uniformList[4] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    attribute = new ShaderAttributeObject("normal", 3);
    this.attributeList[1] = attribute;

    attribute = new ShaderAttributeObject("instanceMMatrix", 16);
    this.attributeList[2] = attribute;

    attribute = new ShaderAttributeObject("instanceColor", 4);
    this.attributeList[3] = attribute;

    this.createProgram();
  }
}
