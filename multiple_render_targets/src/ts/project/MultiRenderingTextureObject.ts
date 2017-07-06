import {RenderingTextureObject} from "../myLib/webgl/engine/RenderingTextureObject";
import {TextureTypeObject} from "./TextureTypeObject";
/**
 * @author Kentaro Kawakatsu
 */
export class MultiRenderingTextureObject extends RenderingTextureObject
{
  public context2:WebGL2RenderingContext;
  public textureList:WebGLTexture[];

  public textureTypeList:TextureTypeObject[];

  constructor($context:WebGL2RenderingContext, $width:number, $height:number, $textureTypeList:TextureTypeObject[])
  {
    super($context, $width, $height);

    this.textureTypeList = $textureTypeList;

    this.initMulti();
  }

  public init():void
  {
    // do nothing
  }

  public initMulti():void
  {
    this.context2 = <WebGL2RenderingContext> this.context;

    this.renderBuffer = this.context.createRenderbuffer();
    this.context.bindRenderbuffer(this.context.RENDERBUFFER, this.renderBuffer);
    this.context.renderbufferStorage(this.context.RENDERBUFFER, this.context.DEPTH_COMPONENT16, this.width, this.height);

    this.frameBuffer = this.context.createFramebuffer();
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.frameBuffer);
    this.context.framebufferRenderbuffer(this.context.FRAMEBUFFER, this.context.DEPTH_ATTACHMENT, this.context.RENDERBUFFER, this.renderBuffer);

    this.textureList = [];
    let drawBuffers:number[] = [];
    let length:number = this.textureTypeList.length;
    for (let i:number = 0; i < length; i++)
    {
      let textureType:TextureTypeObject = this.textureTypeList[i];
      let texture:WebGLTexture = this.context.createTexture();
      this.context.bindTexture(this.context.TEXTURE_2D, texture);
      this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, false);
      this.context.texImage2D(this.context.TEXTURE_2D, 0, textureType.internalformat, this.width, this.height, 0, textureType.format, textureType.type, null);
      this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
      this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
      this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
      this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);

      this.context.framebufferTexture2D(this.context2.DRAW_FRAMEBUFFER, this.context2["COLOR_ATTACHMENT" + i], this.context.TEXTURE_2D, texture, 0);

      this.textureList[i] = texture;
      drawBuffers[i] = this.context2["COLOR_ATTACHMENT" + i];
    }
    this.context2.drawBuffers(drawBuffers);

    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.context.bindRenderbuffer(this.context.RENDERBUFFER, null);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
  }
}
