import {vec4} from "gl-matrix";
import {Primitive} from "../myLib/webgl/primitive/Primitive";
import {Sphere} from "../myLib/webgl/primitive/Sphere";
/**
 * @author Kentaro Kawakatsu
 */
export class DeferredPointLight
{
  public static proxy:Sphere;

  public static init($context:WebGLRenderingContext):void
  {
    // diffuse = ((1 - lightDistance / distance)^attenuation) * intensity * color
    DeferredPointLight.proxy = new Sphere($context, 1.0, 10, 10, Primitive.ATTRIBUTE_USE_POSITION);
  }

  public color:number;
  public colorVec:vec4;
  public data:any;
  public intensity:number;
  public distance:number;
  public attenuation:number;

  public x:number = 0.0;
  public y:number = 0.0;
  public z:number = 0.0;

  constructor(color:number, intensity:number, distance:number, attenuation:number, data:any)
  {
    this.color = color;
    this.intensity = intensity;
    this.distance = distance;
    this.attenuation = attenuation;
    this.colorVec = vec4.fromValues(
      ((color >> 16) & 0xFF) / 255,
      ((color >> 8) & 0xFF) / 255,
      (color & 0xFF) / 255,
      1.0);
    this.data = data;
  }
}
