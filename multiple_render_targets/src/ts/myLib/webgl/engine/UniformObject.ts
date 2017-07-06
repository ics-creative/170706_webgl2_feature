import {mat4, vec3, vec4} from "gl-matrix";
/**
 * @author Kentaro Kawakatsu
 */
export class UniformObject
{
  public static TYPE_VALUE:number = 0;
  public static TYPE_VECTOR3:number = 1;
  public static TYPE_VECTOR4:number = 2;
  public static TYPE_MATRIX:number = 3;
  public static TYPE_TEXTURE:number = 4;

  public type:number;
  public name:string;
  public location:WebGLUniformLocation;
  public value:number;
  public vector3:vec3;
  public vector4:vec4;
  public matrix:mat4;
  public texture:WebGLTexture;

  constructor($type:number, $name:string)
  {
    this.name = $name;
    this.type = $type;
  }
}
