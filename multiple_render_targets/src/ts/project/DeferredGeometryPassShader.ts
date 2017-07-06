import {vec4} from "gl-matrix";
import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {ShaderObject} from "../myLib/webgl/engine/ShaderObject";
import {UniformObject} from "../myLib/webgl/engine/UniformObject";
/**
 * @author Kentaro Kawakatsu
 */
export class DeferredGeometryPassShader extends ShaderObject
{
  private _color:number = 0x0;

  public set color(value:number)
  {
    if (value !== this._color)
    {
      this._color = value;

      let r:number = ((value >> 16) & 0xFF) / 255;
      let g:number = ((value >> 8) & 0xFF) / 255;
      let b:number = (value & 0xFF) / 255;
      vec4.set(this.uniformList[2].vector4, r, g, b, this._alpha);
    }
  }

  public get color():number
  {
    return this._color;
  }

  private _alpha:number = 1.0;

  public set alpha(value:number)
  {
    if (value !== this._alpha)
    {
      this._alpha = value;
      this.uniformList[2].vector4.set(3, value);
    }
  }

  public get alpha():number
  {
    return this._alpha;
  }

  public init():void
  {
    // language=GLSL
    this.vShaderSource = `#version 300 es
    in vec3 position;
    in vec3 normal;
    uniform mat4 mvpMatrix;
    uniform mat4 modelMatrix;
    uniform vec4 color;
    out vec4 vPosition;
    out vec3 vNormal;
    out vec4 vColor;
    out float vDepth;
    
    void main(void)
    {
      vec4 position4 = vec4(position, 1.0);
      vPosition = modelMatrix * position4;
      vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
      vColor = color;
      gl_Position = mvpMatrix * position4;
      vDepth = gl_Position.z / gl_Position.w;
    }
    `;

    // language=GLSL
    this.fShaderSource = `#version 300 es
    precision mediump float;
    
    in vec4 vPosition;
    in vec3 vNormal;
    in vec4 vColor;
    in float vDepth;
    layout(location = 0) out vec4 outPosition;
    layout(location = 1) out vec4 outNormal;
    layout(location = 2) out vec4 outColor;
    layout(location = 3) out vec4 outDepth;
     
    void main(void)
    {
      outPosition = vPosition;
      outNormal = vec4(normalize(vNormal), 1.0);
      outColor = vColor;
      outDepth = vec4(vec3((vDepth + 1.0) * 0.5), 1.0);
    }
    `;

    let uniform:UniformObject;
    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "mvpMatrix");
    this.uniformList[0] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_MATRIX, "modelMatrix");
    this.uniformList[1] = uniform;

    uniform = new UniformObject(UniformObject.TYPE_VECTOR4, "color");
    uniform.vector4 = vec4.create();
    this.uniformList[2] = uniform;

    let attribute:ShaderAttributeObject;
    attribute = new ShaderAttributeObject("position", 3);
    this.attributeList[0] = attribute;

    attribute = new ShaderAttributeObject("normal", 3);
    this.attributeList[1] = attribute;

    this.createProgram();
  }
}
