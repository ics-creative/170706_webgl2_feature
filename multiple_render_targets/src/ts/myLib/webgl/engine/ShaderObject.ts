import {ShaderAttributeObject} from "./ShaderAttributeObject";
import {UniformObject} from "./UniformObject";
/**
 * @author Kentaro Kawakatsu
 */
export class ShaderObject
{
  public context:WebGLRenderingContext;

  public program:WebGLProgram;
  public vShader:WebGLShader;
  public fShader:WebGLShader;
  public uniformList:UniformObject[];
  public attributeList:ShaderAttributeObject[];

  public vShaderSource:string;
  public fShaderSource:string;

  constructor($context:WebGLRenderingContext)
  {
    this.context = $context;

    this.uniformList = [];
    this.attributeList = [];
    this.init();
  }

  public init():void
  {

  }

  public createProgram():void
  {
    this.vShader = this.creatShader(this.vShaderSource, this.context.VERTEX_SHADER);
    this.fShader = this.creatShader(this.fShaderSource, this.context.FRAGMENT_SHADER);

    this.program = this.context.createProgram();
    this.context.attachShader(this.program, this.vShader);
    this.context.attachShader(this.program, this.fShader);

    this.context.linkProgram(this.program);

    let i:number;
    let length:number;

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

  public bindShader():void
  {
    this.bindProgram();
    this.bindUniform();
  }

  public bindProgram():void
  {
    if (this.context.getProgramParameter(this.program, this.context.LINK_STATUS))
    {
      this.context.useProgram(this.program);
    }
    else
    {
      console.log(this.context.getProgramInfoLog(this.program));
    }
  }

  public bindUniform():void
  {
    const length:number = this.uniformList.length;
    for (let i:number = 0; i < length; i++)
    {
      let uniform:UniformObject = this.uniformList[i];
      switch (uniform.type)
      {
        case UniformObject.TYPE_MATRIX:
          this.context.uniformMatrix4fv(uniform.location, false, uniform.matrix);
          break;
        case UniformObject.TYPE_VALUE:
          this.context.uniform1f(uniform.location, uniform.value);
          break;
        case UniformObject.TYPE_VECTOR3:
          this.context.uniform3fv(uniform.location, uniform.vector3);
          break;
        case UniformObject.TYPE_VECTOR4:
          this.context.uniform4fv(uniform.location, uniform.vector4);
          break;
        case UniformObject.TYPE_TEXTURE:
          this.context.uniform1i(uniform.location, uniform.value);
          this.context.activeTexture(this.context["TEXTURE" + uniform.value]);
          this.context.bindTexture(this.context.TEXTURE_2D, uniform.texture);
          break;
        default:
          break;
      }
    }
  }

  public creatShader(source:string, type:number):WebGLShader
  {
    let shader:WebGLShader = this.context.createShader(type);
    this.context.shaderSource(shader, source);
    this.context.compileShader(shader);

    if (this.context.getShaderParameter(shader, this.context.COMPILE_STATUS))
    {
      return shader;
    }
    else
    {
      console.log(type === this.context.VERTEX_SHADER, this.context.getShaderInfoLog(shader));
      return null;
    }
  }

  public getUniform(uniformName:string):UniformObject
  {
    const length:number = this.uniformList.length;
    for (let i:number = 0; i < length; i++)
    {
      let uniform:UniformObject = this.uniformList[i];
      if (uniform.name === uniformName)
      {
        return uniform;
      }
    }
    return null;
  }
}
