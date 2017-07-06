import {Primitive} from "./Primitive";
/**
 * @author Kentaro Kawakatsu
 */
export class Plane extends Primitive
{
  public width:number;
  public height:number;
  public segmentsW:number;
  public segmentsH:number;

  constructor($context:WebGLRenderingContext, width:number, height:number, segmentsW:number, segmentsH:number, useAttribute:number = Primitive.ATTRIBUTE_USE_POSITION)
  {
    super($context);

    this.width = width;
    this.height = height;
    this.segmentsW = segmentsW;
    this.segmentsH = segmentsH;
    this.useAttribute = useAttribute;

    this.setData();
  }

  protected setData():void
  {
    let halfWidth:number = this.width / 2.0;
    let halfHeight:number = this.height / 2.0;

    let segmentWidth:number = this.width / this.segmentsW;
    let segmentHeight:number = this.height / this.segmentsH;

    let wVertices:number = this.segmentsW + 1;
    let hVertices:number = this.segmentsH + 1;

    let positionList:number[] = [];
    let normalList:number[] = [];
    let uvList:number[] = [];
    let indexList:number[] = [];

    for (let j:number = 0; j < hVertices; j++)
    {
      let posY:number = segmentHeight * j - halfHeight;
      let v:number = 1.0 - (j / this.segmentsH);

      for (let i:number = 0; i < wVertices; i++)
      {
        positionList.push(segmentWidth * i - halfWidth, -posY, 0.0);
        normalList.push(0.0, 0.0, 1.0);
        uvList.push(i / this.segmentsW, v);
      }
    }

    this.positionList = positionList;
    this.normalList = normalList;
    this.uvList = uvList;

    this.setAttribute();

    for (let j:number = 0; j < this.segmentsH; j++)
    {
      let j0:number = wVertices * j;
      let j1:number = wVertices * (j + 1);

      for (let i:number = 0; i < this.segmentsW; i++)
      {
        let i0:number = i + j0;
        let i1:number = i + j1;
        let i2:number = i + 1 + j1;
        let i3:number = i + 1 + j0;

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
