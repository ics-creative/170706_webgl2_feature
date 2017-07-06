import {OrthoScreenObject} from "../myLib/webgl/object/OrthoScreenObject";
/**
 * @author Kentaro Kawakatsu
 */
export class DeferredAmbientLight
{
  public static proxy:OrthoScreenObject;

  public static init($context:WebGLRenderingContext):void
  {
    DeferredAmbientLight.proxy = new OrthoScreenObject($context);
  }

  public color:number;
  public intensity:number;

  constructor(color:number, intensity:number)
  {
    this.color = color;
    this.intensity = intensity;
  }
}
