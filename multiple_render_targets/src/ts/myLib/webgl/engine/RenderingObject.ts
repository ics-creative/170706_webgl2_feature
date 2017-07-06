import {ShaderAttributeObject} from "./ShaderAttributeObject";
import {ShaderObject} from "./ShaderObject";
import {VertexAttributeObject} from "./VertexAttributeObject";
/**
 * @author Kentaro Kawakatsu
 */
export class RenderingObject
{
  public context:WebGLRenderingContext;

  public vboList:VertexAttributeObject[];
  public ibo:WebGLBuffer;

  public vboDataList:number[][];
  public iboData:number[];

  public shader:ShaderObject;

  constructor($context:WebGLRenderingContext)
  {
    this.context = $context;

    this.vboList = [];
    this.vboDataList = [];

    this.init();
  }

  public init():void
  {
  }

  public attachShader($shader:ShaderObject):void
  {
    this.shader = $shader;
  }

  public bindVertexbuffer():void
  {
    const length:number = this.shader.attributeList.length;
    for (let i:number = 0; i < length; i++)
    {
      let attribute:ShaderAttributeObject = this.shader.attributeList[i];
      if (attribute.location >= 0)
      {
        let vbo:VertexAttributeObject = this.getVertexBuffer(attribute.name);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, vbo.buffer);
        this.context.enableVertexAttribArray(attribute.location);
        this.context.vertexAttribPointer(attribute.location, attribute.stride, this.context.FLOAT, false, vbo.byteStride, vbo.bufferOffset);
      }
    }
  }

  public getVertexBuffer(attributeName:string):VertexAttributeObject
  {
    const length:number = this.vboList.length;
    for (let i:number = 0; i < length; i++)
    {
      let attribute:VertexAttributeObject = this.vboList[i];
      if (attribute.name === attributeName)
      {
        return attribute;
      }
    }
    return null;
  }

  public bindIndexbuffer():void
  {
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.ibo);
  }
}
