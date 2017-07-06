/**
 * @author Kentaro Kawakatsu
 */
export class TextureTypeObject
{
  public internalformat:number = 0;
  public format:number = 0;
  public type:number = 0;

  constructor(internalformat:number, format:number, type:number)
  {
    this.internalformat = internalformat;
    this.format = format;
    this.type = type;
  }
}
