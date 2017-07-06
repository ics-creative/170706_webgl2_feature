import EventName from "./enum/EventName";
import {RoundCameraController} from "./myLib/webgl/controller/RoundCameraController";
import {Camera} from "./myLib/webgl/engine/Camera";
import {TransformFeedbackShader} from "./project/TransformFeedbackShader";
import {TransformFeedbackVertex} from "./project/TransformFeedbackVertex";
import MouseEventName from "./myLib/enum/events/MouseEventName";
import {vec4} from "gl-matrix";

/**
 * @author Kentaro Kawakatsu
 */
class Main
{
  private static RAD:number = Math.PI / 180;

  private static CANVAS_WIDTH:number = 960;
  private static CANVAS_HEIGHT:number = 540;

  private stats:Stats;

  private canvas:HTMLCanvasElement;
  private context:WebGL2RenderingContext;

  private controller:RoundCameraController;
  private camera:Camera;

  private numParticles:number = 100000;

  private transformFeedback:WebGLTransformFeedback;
  private transformFeedbackVertex1:TransformFeedbackVertex;
  private transformFeedbackVertex2:TransformFeedbackVertex;
  private transformFeedbackShader:TransformFeedbackShader;

  private time:number = 0;
  private mouseX:number = 0;
  private mouseY:number = 0;

  constructor()
  {
    console.log(new Date());

    this.canvas = <HTMLCanvasElement> document.getElementById(("myCanvas"));
    this.canvas.width = Main.CANVAS_WIDTH;
    this.canvas.height = Main.CANVAS_HEIGHT;
    this.context = <WebGL2RenderingContext> this.canvas.getContext("webgl2");

    if (!this.context)
    {
      // WebGL2 is not supported
      this.canvas.style.display = "none";
      return;
    }
    (<HTMLCanvasElement> document.getElementById(("notSupportedDescription"))).style.display = "none";

    // Stats
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clearDepth(1.0);
    this.context.enable(this.context.BLEND);
    this.context.blendEquation(this.context.FUNC_ADD);
    this.context.blendFunc(this.context.ONE, this.context.ONE);
    //
    this.transformFeedback = this.context.createTransformFeedback();
    this.transformFeedbackShader = new TransformFeedbackShader(this.context);
    this.transformFeedbackVertex1 = new TransformFeedbackVertex(this.context, this.numParticles);
    this.transformFeedbackVertex1.attachShader(this.transformFeedbackShader);
    this.transformFeedbackVertex2 = new TransformFeedbackVertex(this.context, this.numParticles);
    this.transformFeedbackVertex2.attachShader(this.transformFeedbackShader);
    //
    this.canvas.addEventListener(MouseEventName.MOUSE_MOVE, (event:MouseEvent) =>
    {
      let rect:ClientRect = (<Element> event.target).getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) / Main.CANVAS_WIDTH;
      this.mouseY = (event.clientY - rect.top) / Main.CANVAS_HEIGHT;
    });
    //
    this.camera = new Camera(60 * Main.RAD, Main.CANVAS_WIDTH / Main.CANVAS_HEIGHT, 0.1, 1000.0);
    this.controller = new RoundCameraController(this.camera, this.canvas);
    this.canvas.style.cursor = "move";
    this.controller.radius = 80;
    this.controller.radiusOffset = 1;
    this.controller.rotate(0, 0);

    this.render();
  }

  private render():void
  {
    this.stats.begin();

    this.controller.upDate(0.1);
    //
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    //
    this.transformFeedbackShader.getUniform("mvpMatrix").matrix = this.camera.getCameraMtx();
    this.transformFeedbackShader.getUniform("mouse").vector4 = vec4.fromValues(1 / (40.0 + this.mouseX * 20.0), 1 / (1.0 + this.mouseY * 20.0), 0, 0);
    this.transformFeedbackShader.getUniform("time").value = this.time;
    this.context.bindTransformFeedback(this.context.TRANSFORM_FEEDBACK, this.transformFeedback);
    // this.context.enable(this.context.RASTERIZER_DISCARD);
    this.transformFeedbackShader.bindShader();
    this.transformFeedbackVertex1.bindVertexbuffer();
    this.transformFeedbackVertex2.bindBufferBase();
    this.context.beginTransformFeedback(this.context.POINTS);
    this.context.drawArrays(this.context.POINTS, 0, this.numParticles);
    this.context.endTransformFeedback();
    this.context.bindTransformFeedback(this.context.TRANSFORM_FEEDBACK, null);
    this.transformFeedbackVertex2.unbindBufferBase();
    // this.context.disable(this.context.RASTERIZER_DISCARD);
    let tmp:TransformFeedbackVertex = this.transformFeedbackVertex2;
    this.transformFeedbackVertex2 = this.transformFeedbackVertex1;
    this.transformFeedbackVertex1 = tmp;
    //
    this.context.flush();

    this.time += 1;

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }
}

window.addEventListener(EventName.DOM_CONTENT_LOADED, () => new Main());
