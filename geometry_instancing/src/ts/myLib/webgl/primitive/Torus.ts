import {vec3} from "gl-matrix";
import {Primitive} from "./Primitive";
/**
 * @author Kentaro Kawakatsu
 */
export class Torus extends Primitive
{
  public radius:number;
  public tube:number;
  public segmentsR:number;
  public segmentsT:number;

  constructor($context:WebGLRenderingContext, radius:number, tube:number, segmentsR:number, segmentsT:number, useAttribute:number = Primitive.ATTRIBUTE_USE_POSITION)
  {
    super($context);

    this.radius = radius;
    this.tube = tube;
    this.segmentsR = segmentsR;
    this.segmentsT = segmentsT;
    this.useAttribute = useAttribute;

    this.setData();
  }

  protected setData():void
  {
    let vec:vec3 = vec3.create();

    let positionList:number[] = [];
    let normalList:number[] = [];
    let uvList:number[] = [];
    let indexList:number[] = [];

    for (let j:number = 0; j <= this.segmentsR; j++)
    {
      let vUnit:number = j / this.segmentsR;
      let v:number = vUnit * Math.PI * 2;

      for (let i:number = 0; i <= this.segmentsT; i++)
      {
        let uUnit:number = i / this.segmentsT;
        let u:number = uUnit * Math.PI * 2;

        let cosU:number = Math.cos(u);
        let sinU:number = Math.sin(u);
        let cosV:number = Math.cos(v);

        let rr:number = this.radius + this.tube * cosV;

        vec[0] = rr * cosU;
        vec[1] = rr * sinU;
        vec[2] = this.tube * Math.sin(v);

        positionList.push(vec[0], vec[1], vec[2]);

        vec[0] -= this.radius * cosU;
        vec[1] -= this.radius * sinU;
        vec3.normalize(vec, vec);
        normalList.push(vec[0], vec[1], vec[2]);

        uvList.push(uUnit, vUnit);
      }
    }

    this.positionList = positionList;
    this.normalList = normalList;
    this.uvList = uvList;

    this.setAttribute();

    for (let j:number = 1; j <= this.segmentsR; j++)
    {
      for (let i:number = 1; i <= this.segmentsT; i++)
      {
        let seg:number = this.segmentsT + 1;

        let i0:number = seg * j + i - 1;
        let i1:number = seg * (j - 1) + i - 1;
        let i2:number = seg * (j - 1) + i;
        let i3:number = seg * j + i;

        indexList.push(i0, i1, i3);
        indexList.push(i1, i2, i3);
      }
    }

    this.iboData = indexList;

    this.ibo = this.context.createBuffer();
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Int16Array(this.iboData), this.context.STATIC_DRAW);
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, null);
  }
}
