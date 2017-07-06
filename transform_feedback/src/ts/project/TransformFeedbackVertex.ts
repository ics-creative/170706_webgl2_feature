import {RenderingObject} from "../myLib/webgl/engine/RenderingObject";
import {VertexAttributeObject} from "../myLib/webgl/engine/VertexAttributeObject";
import {TransformFeedbackShader} from "./TransformFeedbackShader";
import {TransformFeedbackVaryingObject} from "./TransformFeedbackVaryingObject";
/**
 * @author Kentaro Kawakatsu
 */
export class TransformFeedbackVertex extends RenderingObject
{
  private context2:WebGL2RenderingContext;

  public numParticles:number;
  public vertexIDList:number[];
  public positionList:number[];
  public velocityList:number[];
  public birthList:number[];

  constructor($context:WebGLRenderingContext, $numParticles:number)
  {
    super($context);

    this.context2 = <WebGL2RenderingContext> $context;
    this.numParticles = $numParticles;

    this.setData();
  }

  protected setData():void
  {
    let vertexIDList:number[] = [];
    let positionList:number[] = [];
    let velocityList:number[] = [];
    let birthList:number[] = [];

    for (let i:number = 0; i < this.numParticles; i++)
    {
      vertexIDList[i] = i;

      positionList[i * 3] = 0;
      positionList[i * 3 + 1] = 0;
      positionList[i * 3 + 2] = 0;

      velocityList[i * 3] = 0;
      velocityList[i * 3 + 1] = 0;
      velocityList[i * 3 + 2] = 0;

      birthList[i] = 0;
    }
    this.positionList = positionList;
    this.velocityList = velocityList;
    this.vertexIDList = vertexIDList;
    this.birthList = birthList;

    let attribute:VertexAttributeObject;

    attribute = new VertexAttributeObject("vertexID");
    attribute.buffer = this.context.createBuffer();
    this.vboList.push(attribute);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vertexIDList), this.context.STATIC_DRAW);

    attribute = new VertexAttributeObject("position");
    attribute.buffer = this.context.createBuffer();
    this.vboList.push(attribute);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positionList), this.context2.STREAM_COPY);

    attribute = new VertexAttributeObject("velocityTotal");
    attribute.buffer = this.context.createBuffer();
    this.vboList.push(attribute);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(velocityList), this.context2.STREAM_COPY);

    attribute = new VertexAttributeObject("birth");
    attribute.buffer = this.context.createBuffer();
    this.vboList.push(attribute);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, attribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(birthList), this.context2.STREAM_COPY);

    this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
  }

  public bindBufferBase():void
  {
    let context2:WebGL2RenderingContext = <WebGL2RenderingContext> this.context;
    let shader2:TransformFeedbackShader = <TransformFeedbackShader> this.shader;

    const length:number = shader2.transformFeedbackVaryingList.length;
    for (let i:number = 0; i < length; i++)
    {
      let varying:TransformFeedbackVaryingObject = shader2.transformFeedbackVaryingList[i];
      let vbo:VertexAttributeObject = this.getTransformFeedbackVertexBuffer(varying.name);
      context2.bindBufferBase(context2.TRANSFORM_FEEDBACK_BUFFER, varying.location, vbo.buffer);
    }
  }

  public unbindBufferBase():void
  {
    let shader2:TransformFeedbackShader = <TransformFeedbackShader> this.shader;

    const length:number = shader2.transformFeedbackVaryingList.length;
    for (let i:number = 0; i < length; i++)
    {
      let varying:TransformFeedbackVaryingObject = shader2.transformFeedbackVaryingList[i];
      this.context2.bindBufferBase(this.context2.TRANSFORM_FEEDBACK_BUFFER, varying.location, null);
    }
  }

  public getTransformFeedbackVertexBuffer(varyingName:string):VertexAttributeObject
  {
    let attribute:VertexAttributeObject;
    if (varyingName === "vPosition")
    {
      attribute = this.getVertexBuffer("position");
    }
    else if (varyingName === "vVelocityTotal")
    {
      attribute = this.getVertexBuffer("velocityTotal");
    }
    else if (varyingName === "vBirth")
    {
      attribute = this.getVertexBuffer("birth");
    }
    return attribute;
  }
}
