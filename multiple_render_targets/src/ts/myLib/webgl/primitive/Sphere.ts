import {vec3} from "gl-matrix";
import {Primitive} from "./Primitive";
/**
 * @author Kentaro Kawakatsu
 */
export class Sphere extends Primitive
{
  public radius:number;
  public segmentsW:number;
  public segmentsH:number;

  constructor($context:WebGLRenderingContext, radius:number, segmentsW:number, segmentsH:number, useAttribute:number = Primitive.ATTRIBUTE_USE_POSITION)
  {
    super($context);

    this.radius = radius;
    this.segmentsW = segmentsW;
    this.segmentsH = segmentsH;
    this.useAttribute = useAttribute;

    this.setData();
  }

  protected setData():void
  {
    let vec:vec3 = vec3.create();
    let grid:number[][] = [];
    let idx:number = 0;

    let positionList:number[] = [];
    let normalList:number[] = [];
    let uvList:number[] = [];

    for (let j:number = 0; j <= this.segmentsH; j++)
    {
      let verticesRow:number[] = [];

      let v:number = j / this.segmentsH;
      let theta:number = v * Math.PI;

      for (let i:number = 0; i <= this.segmentsW; i++)
      {
        let u:number = i / this.segmentsW;
        let phi:number = u * 2 * Math.PI;

        vec[0] = -this.radius * Math.cos(phi) * Math.sin(theta);
        vec[1] = this.radius * Math.cos(theta);
        vec[2] = this.radius * Math.sin(phi) * Math.sin(theta);

        positionList.push(vec[0], vec[1], vec[2]);
        vec3.normalize(vec, vec);
        normalList.push(vec[0], vec[1], vec[2]);
        uvList.push(u, 1 - v);

        verticesRow.push(idx);
        idx += 1;
      }
      grid.push(verticesRow);
    }

    this.positionList = positionList;
    this.normalList = normalList;
    this.uvList = uvList;

    this.setAttribute();

    let indexList:number[] = [];

    for (let j:number = 0; j < this.segmentsH; j++)
    {
      for (let i:number = 0; i < this.segmentsW; i++)
      {
        let i0:number = grid[j][i + 1];
        let i1:number = grid[j][i];
        let i2:number = grid[j + 1][i];
        let i3:number = grid[j + 1][i + 1];

        if (j !== 0)
        {
          indexList.push(i0, i1, i3);
        }

        if (j !== this.segmentsH - 1)
        {
          indexList.push(i1, i2, i3);
        }
      }
    }

    this.iboData = indexList;

    this.ibo = this.context.createBuffer();
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Int16Array(this.iboData), this.context.STATIC_DRAW);
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, null);
  }
}
