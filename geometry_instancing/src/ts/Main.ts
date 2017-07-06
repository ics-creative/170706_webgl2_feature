import {GUI, GUIController} from "dat-gui";
import {vec3, vec4} from "gl-matrix";
import EventName from "./enum/EventName";
import {RoundCameraController} from "./myLib/webgl/controller/RoundCameraController";
import {Camera} from "./myLib/webgl/engine/Camera";
import {Primitive} from "./myLib/webgl/primitive/Primitive";
import {GUIPanel} from "./project/GUIPanel";
import {Shader} from "./project/Shader";
import {TorusInstance} from "./project/TorusInstance";

declare let dat:any;

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

  private torus:TorusInstance;
  private numInstance:number = 1000;
  private useWireframe:boolean = false;

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
    // GUI
    let panel:GUIPanel = new GUIPanel();
    let gui:GUI = new dat.GUI({autoPlace:false});
    let guiContainer:HTMLElement = document.getElementById("container");
    guiContainer.style.width = Main.CANVAS_WIDTH + "px";
    gui.domElement.classList.add("guiStyle");
    guiContainer.appendChild(gui.domElement);

    let instanceFolder:GUI = gui.addFolder("Instance");
    instanceFolder.open();
    let instanceNumSlider:GUIController = instanceFolder.add(panel, "num", 100, 5000).step(100);
    panel.setGUITitle(gui, "num", "Num");
    instanceNumSlider.onFinishChange((value:number) =>
    {
      this.numInstance = value;
      this.torus.resetInstanceData(value);
    });
    let useWireframeSlider:GUIController = instanceFolder.add(panel, "wireframe");
    panel.setGUITitle(gui, "wireframe", "Wireframe");
    useWireframeSlider.onFinishChange((value:boolean) =>
    {
      this.useWireframe = value;
      if (value)
      {
        this.torus.ibo = this.torus.wireIbo;
      }
      else
      {
        this.torus.ibo = this.torus.objectIbo;
      }
    });

    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clearDepth(1.0);
    this.context.enable(this.context.CULL_FACE);
    this.context.frontFace(this.context.CCW);
    this.context.enable(this.context.DEPTH_TEST);
    this.context.depthFunc(this.context.LEQUAL);

    let torus:TorusInstance = new TorusInstance(this.context, this.numInstance, 2.0, 0.5, 20, 50, (Primitive.ATTRIBUTE_USE_POSITION | Primitive.ATTRIBUTE_USE_NOMRAL));
    this.torus = torus;
    torus.attachShader(new Shader(this.context));
    torus.shader.getUniform("ambientColor").vector4 = vec4.fromValues(0.2, 0.2, 0.2, 1.0);
    torus.shader.getUniform("lightDirection").vector3 = vec3.fromValues(1.0, 1.0, 1.0);
    torus.shader.getUniform("lightColor").vector4 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    torus.shader.getUniform("lightIntensity").value = 0.8;

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
    this.torus.updateInstance();
    //
    this.torus.shader.getUniform("vpMatrix").matrix = this.camera.getCameraMtx();
    //
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    this.torus.shader.bindShader();
    this.torus.bindVertexbuffer();
    this.torus.bindIndexbuffer();
    if (this.useWireframe)
    {
      this.context.drawElementsInstanced(this.context.LINES, this.torus.wireIboData.length, this.context.UNSIGNED_SHORT, 0, this.numInstance);
    }
    else
    {
      this.context.drawElementsInstanced(this.context.TRIANGLES, this.torus.iboData.length, this.context.UNSIGNED_SHORT, 0, this.numInstance);
    }
    this.context.flush();

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }
}

window.addEventListener(EventName.DOM_CONTENT_LOADED, () => new Main());
