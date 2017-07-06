import {mat4, vec3} from "gl-matrix";
import {RenderingObject} from "../engine/RenderingObject";
import {VertexAttributeObject} from "../engine/VertexAttributeObject";
/**
 * @author Kentaro Kawakatsu
 */
export class OrthoScreenObject extends RenderingObject
{
  public screenMatrix:mat4;

  constructor($context:WebGLRenderingContext)
  {
    super($context);
  }

  public init():void
  {
    let vPosition:number[] = [
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ];
    this.iboData = [
      0, 1, 2,
      3, 2, 1
    ];

    let attribute:VertexAttributeObject;
    let vbo:WebGLBuffer;

    vbo = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, vbo);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vPosition), this.context.STATIC_DRAW);
    this.vboDataList[0] = vPosition;
    attribute = new VertexAttributeObject("position");
    attribute.buffer = vbo;
    this.vboList[0] = attribute;

    this.ibo = this.context.createBuffer();
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Int16Array(this.iboData), this.context.STATIC_DRAW);

    //
    let viewMtx:mat4 = mat4.identity(mat4.create());
    let projectionMtx:mat4 = mat4.identity(mat4.create());
    this.screenMatrix = mat4.identity(mat4.create());
    mat4.lookAt(viewMtx, vec3.fromValues(0.0, 0.0, 0.5), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));
    mat4.ortho(projectionMtx, -1.0, 1.0, 1.0, -1.0, 0.1, 1);
    mat4.multiply(this.screenMatrix, projectionMtx, viewMtx);
  }
}
