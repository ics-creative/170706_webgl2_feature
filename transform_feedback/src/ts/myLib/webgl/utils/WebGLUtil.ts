/**
 * @author Kentaro Kawakatsu
 */
export class WebGLUtil
{

  public static init():void
  {

  }

  public static supportsWebGL():boolean
  {
    try
    {
      return !!WebGLRenderingContext && (!!document.createElement("canvas").getContext("webgl") || !!document.createElement("canvas").getContext("experimental-webgl"));
    } catch (e)
    {
      return false;
    }
  }

  public static getPowerOf2(w:number, h:number):any
  {
    let ww:number = w;
    let hh:number = h;
    if (!WebGLUtil.isPowerOfTwo(w))
    {
      ww = WebGLUtil.nextHighestPowerOfTwo(w);
    }
    if (!WebGLUtil.isPowerOfTwo(h))
    {
      hh = WebGLUtil.nextHighestPowerOfTwo(h);
    }
    return {w:ww, h:hh};
  }

  private static isPowerOfTwo(value:number):boolean
  {
    return (value & (value - 1)) === 0;
  }

  private static nextHighestPowerOfTwo(value:number):number
  {
    --value;
    for (let i:number = 1; i < 32; i <<= 1)
    {
      value = value | value >> i;
    }
    return value + 1;
  }

  constructor()
  {

  }
}
