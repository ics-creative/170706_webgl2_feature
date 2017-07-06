/**
 * @author Kentaro Kawakatsu
 */
export class ShaderAttributeObject
{
  public name:string;
  public stride:number;
  public location:number;

  constructor($name:string, $stride:number)
  {
    this.name = $name;
    this.stride = $stride;
  }
}
