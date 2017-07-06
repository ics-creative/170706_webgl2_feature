/**
 * @author Kentaro Kawakatsu
 */
export class RenderingTextureObject
{
  public context:WebGLRenderingContext;

  public frameBuffer:WebGLFramebuffer;
  public renderBuffer:WebGLRenderbuffer;
  public texture:WebGLTexture;

  public width:number;
  public height:number;

  constructor($context:WebGLRenderingContext, $width:number, $height:number)
  {
    this.context = $context;
    this.width = $width;
    this.height = $height;
    this.init();
  }

  public init():void
  {
    this.renderBuffer = this.context.createRenderbuffer();
    this.context.bindRenderbuffer(this.context.RENDERBUFFER, this.renderBuffer);
    this.context.renderbufferStorage(this.context.RENDERBUFFER, this.context.DEPTH_COMPONENT16, this.width, this.height);

    this.frameBuffer = this.context.createFramebuffer();
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.frameBuffer);
    this.context.framebufferRenderbuffer(this.context.FRAMEBUFFER, this.context.DEPTH_ATTACHMENT, this.context.RENDERBUFFER, this.renderBuffer);

    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.width, this.height, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, null);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);

    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);

    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.context.bindRenderbuffer(this.context.RENDERBUFFER, null);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
  }
}
