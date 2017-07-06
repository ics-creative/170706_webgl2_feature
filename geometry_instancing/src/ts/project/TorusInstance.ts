import {mat4} from "gl-matrix";
import {ShaderAttributeObject} from "../myLib/webgl/engine/ShaderAttributeObject";
import {VertexAttributeObject} from "../myLib/webgl/engine/VertexAttributeObject";
import {Primitive} from "../myLib/webgl/primitive/Primitive";
import {Torus} from "../myLib/webgl/primitive/Torus";
import {InstanceAttributeObject} from "./InstanceAttributeObject";
import {InstanceProperty} from "./InstanceProperty";
import {RGB} from "./RGB";
/**
 * @author Kentaro Kawakatsu
 */
export class TorusInstance extends Torus
{
  public numInstance:number;
  public instanceList:InstanceProperty[];
  public instanceMMatrixDataList:Float32Array;
  public instanceColorDataList:Float32Array;
  public wireIboData:number[];
  public wireIbo:WebGLBuffer;
  public objectIbo:WebGLBuffer;

  constructor($context:WebGL2RenderingContext, numInstance:number, radius:number, tube:number, segmentsR:number, segmentsT:number, useAttribute:number = Primitive.ATTRIBUTE_USE_POSITION)
  {
    super($context, radius, tube, segmentsR, segmentsT, useAttribute);
    this.createWireframeIndices();
    this.setInstanceData(numInstance);
  }

  private createWireframeIndices():void
  {
    let i0:number;
    let i1:number;
    let i2:number;
    let imin:number;
    let imax:number;
    let key:string;

    let hash:object = {};
    let indexList:number[] = [];
    let length:number = this.iboData.length / 3;
    for (let i:number = 0; i < length; i++)
    {
      i0 = this.iboData[i * 3];
      i1 = this.iboData[i * 3 + 1];
      i2 = this.iboData[i * 3 + 2];

      // i0:i1
      imin = i0 > i1 ? i1 : i0;
      imax = i0 > i1 ? i0 : i1;
      key = imin + ":" + imax;
      if (!hash[key])
      {
        hash[key] = true;
        indexList.push(imin, imax);
      }

      // i1:i2
      imin = i1 > i2 ? i2 : i1;
      imax = i1 > i2 ? i1 : i2;
      key = imin + ":" + imax;
      if (!hash[key])
      {
        hash[key] = true;
        indexList.push(imin, imax);
      }

      // i2:i0
      imin = i2 > i0 ? i0 : i2;
      imax = i2 > i0 ? i2 : i0;
      key = imin + ":" + imax;
      if (!hash[key])
      {
        hash[key] = true;
        indexList.push(imin, imax);
      }
    }

    this.wireIboData = indexList;

    this.wireIbo = this.context.createBuffer();
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.wireIbo);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Int16Array(this.wireIboData), this.context.STATIC_DRAW);
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, null);

    this.objectIbo = this.ibo;
  }

  private setInstanceData(num:number):void
  {
    let instanceAttribute:InstanceAttributeObject;

    instanceAttribute = new InstanceAttributeObject("instanceMMatrix");
    this.vboList.push(instanceAttribute);

    instanceAttribute = new InstanceAttributeObject("instanceColor");
    this.vboList.push(instanceAttribute);

    this.resetInstanceData(num);
  }

  public resetInstanceData(num:number):void
  {
    this.numInstance = num;

    let instanceList:InstanceProperty[] = [];
    let instanceMMatrixList:number[] = [];
    let instanceColorList:number[] = [];

    for (let i:number = 0; i < this.numInstance; i++)
    {
      let instance:InstanceProperty = new InstanceProperty();
      instance.x = (Math.random() - 0.5) * 60.0;
      instance.y = (Math.random() - 0.5) * 60.0;
      instance.z = (Math.random() - 0.5) * 60.0;
      instance.rotationX = Math.random() * Math.PI;
      instance.rotationZ = Math.random() * Math.PI;

      let xRotationVelocity:number = Math.random() * 0.14;
      xRotationVelocity -= xRotationVelocity > 0.07 ? 0.04 : 0.1;
      let zRotationVelocity:number = Math.random() * 0.14;
      zRotationVelocity -= zRotationVelocity > 0.07 ? 0.04 : 0.1;
      instance.xRotationVelocity = xRotationVelocity;
      instance.zRotationVelocity = zRotationVelocity;

      let mtx:mat4 = instance.getModelMtx();
      Array.prototype.push.apply(instanceMMatrixList, mtx);
      instanceList.push(instance);

      let color:RGB = RGB.createFromHSV(360 * Math.random(), 0.6, 0.9);
      // let color:RGB = RGB.createFromHSV((instance.x + 30) * 360 / 60, 0.5, 0.9);
      instanceColorList.push(color.r, color.g, color.b, 1.0);
    }
    this.instanceList = instanceList;
    this.instanceMMatrixDataList = new Float32Array(instanceMMatrixList);
    this.instanceColorDataList = new Float32Array(instanceColorList);

    let instanceAttribute:InstanceAttributeObject;

    instanceAttribute = <InstanceAttributeObject> this.getVertexBuffer("instanceMMatrix");
    if (instanceAttribute.buffer)
    {
      this.context.deleteBuffer(instanceAttribute.buffer);
    }
    instanceAttribute.buffer = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, instanceAttribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, this.instanceMMatrixDataList, this.context.DYNAMIC_DRAW);

    instanceAttribute = <InstanceAttributeObject> this.getVertexBuffer("instanceColor");
    if (instanceAttribute.buffer)
    {
      this.context.deleteBuffer(instanceAttribute.buffer);
    }
    instanceAttribute.buffer = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, instanceAttribute.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, this.instanceColorDataList, this.context.STATIC_DRAW);
  }

  public updateInstance():void
  {
    for (let i:number = 0; i < this.numInstance; i++)
    {
      let instance:InstanceProperty = this.instanceList[i];
      instance.rotationX += instance.xRotationVelocity;
      instance.rotationZ += instance.zRotationVelocity;
      let mtx:mat4 = instance.getModelMtx();
      let offset:number = i * 16;
      for (let j:number = 0; j < 16; j++)
      {
        this.instanceMMatrixDataList[offset + j] = mtx[j];
      }
    }
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vboList[2].buffer);
    this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, this.instanceMMatrixDataList);
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
        if (attribute.stride === 16)
        {
          this.context.enableVertexAttribArray(attribute.location);
          this.context.vertexAttribPointer(attribute.location, 4, this.context.FLOAT, false, 64, 0);
          this.context.enableVertexAttribArray(attribute.location + 1);
          this.context.vertexAttribPointer(attribute.location + 1, 4, this.context.FLOAT, false, 64, 16);
          this.context.enableVertexAttribArray(attribute.location + 2);
          this.context.vertexAttribPointer(attribute.location + 2, 4, this.context.FLOAT, false, 64, 32);
          this.context.enableVertexAttribArray(attribute.location + 3);
          this.context.vertexAttribPointer(attribute.location + 3, 4, this.context.FLOAT, false, 64, 48);
        }
        else
        {
          this.context.enableVertexAttribArray(attribute.location);
          this.context.vertexAttribPointer(attribute.location, attribute.stride, this.context.FLOAT, false, vbo.byteStride, vbo.bufferOffset);
        }

        if (vbo instanceof InstanceAttributeObject)
        {
          let instanceAttribute:InstanceAttributeObject = <InstanceAttributeObject> vbo;
          if (attribute.stride === 16)
          {
            (<WebGL2RenderingContext> this.context).vertexAttribDivisor(attribute.location, instanceAttribute.divisor);
            (<WebGL2RenderingContext> this.context).vertexAttribDivisor(attribute.location + 1, instanceAttribute.divisor);
            (<WebGL2RenderingContext> this.context).vertexAttribDivisor(attribute.location + 2, instanceAttribute.divisor);
            (<WebGL2RenderingContext> this.context).vertexAttribDivisor(attribute.location + 3, instanceAttribute.divisor);
          }
          else
          {
            (<WebGL2RenderingContext> this.context).vertexAttribDivisor(attribute.location, instanceAttribute.divisor);
          }
        }
      }
    }
  }
}
