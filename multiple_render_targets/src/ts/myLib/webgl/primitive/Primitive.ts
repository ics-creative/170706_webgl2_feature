import {VertexAttributeObject} from "../engine/VertexAttributeObject";
import {SceneObject} from "../object/SceneObject";
/**
 * @author Kentaro Kawakatsu
 */
export class Primitive extends SceneObject
{
  public static ATTRIBUTE_USE_POSITION:number = 0x01;
  public static ATTRIBUTE_USE_NOMRAL:number = 0x02;
  public static ATTRIBUTE_USE_UV:number = 0x04;

  public numVertices:number;
  public numIndices:number;

  public positionList:number[];
  public normalList:number[];
  public uvList:number[];

  public useAttribute:number;

  constructor($context:WebGLRenderingContext)
  {
    super($context);
  }

  public init():void
  {

  }

  protected setData():void
  {

  }

  public setAttribute():void
  {
    let usePosition:boolean = (this.useAttribute & Primitive.ATTRIBUTE_USE_POSITION) !== 0x0;
    let useNormal:boolean = (this.useAttribute & Primitive.ATTRIBUTE_USE_NOMRAL) !== 0x0;
    let useUV:boolean = (this.useAttribute & Primitive.ATTRIBUTE_USE_UV) !== 0x0;

    let attribute:VertexAttributeObject;

    if (usePosition)
    {
      attribute = new VertexAttributeObject("position");
      attribute.buffer = this.context.createBuffer();
      this.vboList.push(attribute);

      this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(this.positionList), this.context.STATIC_DRAW);
    }

    if (useNormal)
    {
      attribute = new VertexAttributeObject("normal");
      attribute.buffer = this.context.createBuffer();
      this.vboList.push(attribute);

      this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(this.normalList), this.context.STATIC_DRAW);
    }

    if (useUV)
    {
      attribute = new VertexAttributeObject("uv");
      attribute.buffer = this.context.createBuffer();
      this.vboList.push(attribute);

      this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(this.uvList), this.context.STATIC_DRAW);
    }

    this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
  }
}
