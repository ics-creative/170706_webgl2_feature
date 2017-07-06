/**
 * @author Kentaro Kawakatsu
 */
export class VertexAttributeObject
{
  public name:string;
  public byteStride:number = 0;
  public bufferOffset:number = 0;
  public buffer:WebGLBuffer;

  constructor($name:string)
  {
    this.name = $name;
  }
}
