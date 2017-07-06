import {VertexAttributeObject} from "../myLib/webgl/engine/VertexAttributeObject";
/**
 * @author Kentaro Kawakatsu
 */
export class InstanceAttributeObject extends VertexAttributeObject
{
  public divisor:number = 1;

  constructor($name:string)
  {
    super($name);
  }
}
