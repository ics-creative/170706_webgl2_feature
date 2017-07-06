/**
 * @author Kentaro Kawakatsu
 */
export class TextureObject
{
  public context:WebGLRenderingContext;

  public texture:WebGLTexture;

  public image:HTMLImageElement;
  public height:number;

  constructor($context:WebGLRenderingContext)
  {
    this.context = $context;
    this.init();
  }

  public init():void
  {
    this.texture = this.context.createTexture();
  }

  public setImage(image:HTMLImageElement):void
  {
    this.image = image;
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, image);
    this.context.generateMipmap(this.context.TEXTURE_2D);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR_MIPMAP_LINEAR);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
  }
}
