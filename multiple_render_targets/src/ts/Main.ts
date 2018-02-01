import {GUI, GUIController} from "dat-gui";
import {mat4, vec3, vec4} from "gl-matrix";
import * as TWEEN from "@tweenjs/tween.js";
import EventName from "./enum/EventName";
import {RoundCameraController} from "./myLib/webgl/controller/RoundCameraController";
import {Camera} from "./myLib/webgl/engine/Camera";
import {OrthoScreenObject} from "./myLib/webgl/object/OrthoScreenObject";
import {SceneObject} from "./myLib/webgl/object/SceneObject";
import {Plane} from "./myLib/webgl/primitive/Plane";
import {Primitive} from "./myLib/webgl/primitive/Primitive";
import {Sphere} from "./myLib/webgl/primitive/Sphere";
import {Torus} from "./myLib/webgl/primitive/Torus";
import {DeferredAmbientLight} from "./project/DeferredAmbientLight";
import {DeferredAmbientLightPassShader} from "./project/DeferredAmbientLightPassShader";
import {DeferredGeometryPassShader} from "./project/DeferredGeometryPassShader";
import {DeferredPointLight} from "./project/DeferredPointLight";
import {DeferredPointLightPassShader} from "./project/DeferredPointLightPassShader";
import {GUIPanel} from "./project/GUIPanel";
import {MRTScreenShader} from "./project/MRTScreenShader";
import {MultiRenderingTextureObject} from "./project/MultiRenderingTextureObject";
import {PlainColorShader} from "./project/PlainColorShader";
import {RGB} from "./project/RGB";
import {TextureTypeObject} from "./project/TextureTypeObject";
import Tween = TWEEN.Tween;

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

  private objList:SceneObject[];
  private showGbuffer:Boolean;
  private ambientLight:DeferredAmbientLight;
  private lightList:DeferredPointLight[];
  private useLightHelper:Boolean;
  private lightMovementType:string;
  private lightHelper:Sphere;

  private torusList:Torus[];
  private torusRotationList:number[];

  private renderingTexture:MultiRenderingTextureObject;
  private mrtScreenObject:OrthoScreenObject;
  private mrtScreenShader:MRTScreenShader;

  private frame:number = 0;

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

    console.log(this.context.getExtension("EXT_color_buffer_float"));
    // Stats
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
    // GUI
    let panel:GUIPanel = new GUIPanel();
    const lightFolderName:string = "Light";
    let gui:GUI = new dat.GUI({autoPlace:false});
    let guiContainer:HTMLElement = document.getElementById("container");
    guiContainer.style.width = Main.CANVAS_WIDTH + "px";
    gui.domElement.classList.add("guiStyle");
    guiContainer.appendChild(gui.domElement);
    let gbufferCheckBox:GUIController = gui.add(panel, "gbuffer");
    panel.setGUITitle(gui, "gbuffer", "G-buffer");
    gbufferCheckBox.onFinishChange((value:Boolean) =>
    {
      this.showGbuffer = value;
      gui.__folders[lightFolderName].domElement.hidden = value;
    });
    this.showGbuffer = panel.gbuffer;

    let lightFolder:GUI = gui.addFolder(lightFolderName);
    lightFolder.open();
    let lightNumSlider:GUIController = lightFolder.add(panel, "num", 1, 100).step(1);
    panel.setGUITitle(gui, "num", "Num");
    let lightHelperCheckBox:GUIController = lightFolder.add(panel, "helper");
    panel.setGUITitle(gui, "helper", "Helper");
    let lightMovementComboBox:GUIController = lightFolder.add(panel, "movement", GUIPanel.MOVEMENT_LIST);
    panel.setGUITitle(gui, "movement", "Movement");

    lightNumSlider.onFinishChange((value:number) =>
    {
      this.createPointLightList(value);
      if (this.lightMovementType === GUIPanel.MOVEMENT_TYPE_RANDOM)
      {
        this.pointLightUpdateRandom();
      }
    });
    lightHelperCheckBox.onFinishChange((value:Boolean) =>
    {
      this.useLightHelper = value;
    });
    this.useLightHelper = panel.helper;
    lightMovementComboBox.onFinishChange((value:string) =>
    {
      this.lightMovementType = value;
      if (value === GUIPanel.MOVEMENT_TYPE_RANDOM)
      {
        this.pointLightUpdateRandom();
      }
      else
      {
        TWEEN.removeAll();
      }
    });
    this.lightMovementType = panel.movement;
    ////// WebGL
    //// initial settings
    // culling
    this.context.enable(this.context.CULL_FACE);
    this.context.frontFace(this.context.CCW);
    // blend
    this.context.enable(this.context.BLEND);
    this.context.blendEquation(this.context.FUNC_ADD);
    this.context.blendFunc(this.context.ONE, this.context.ONE);
    // depth
    this.context.enable(this.context.DEPTH_TEST);
    this.context.depthFunc(this.context.LEQUAL);
    // clear
    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clearDepth(1.0);

    this.objList = [];
    this.lightList = [];

    let plane:Plane = new Plane(this.context, 8, 8, 10, 10, (Primitive.ATTRIBUTE_USE_POSITION | Primitive.ATTRIBUTE_USE_NOMRAL));
    this.objList.push(plane);
    plane.attachShader(new DeferredGeometryPassShader(this.context));
    (<DeferredGeometryPassShader> plane.shader).color = 0xFFFFFF;
    plane.rotationX = -90 * Main.RAD;
    plane.y = -2;
    //
    let sphere:Sphere = new Sphere(this.context, 0.5, 20, 20, (Primitive.ATTRIBUTE_USE_POSITION | Primitive.ATTRIBUTE_USE_NOMRAL));
    this.objList.push(sphere);
    sphere.attachShader(new DeferredGeometryPassShader(this.context));
    (<DeferredGeometryPassShader> sphere.shader).color = 0xFFFFFF;
    sphere.scaleX = 2;
    sphere.scaleY = 2;
    sphere.scaleZ = 2;
    //
    this.torusList = [];
    this.torusRotationList = [];
    for (let i:number = 0; i < 30; i++)
    {
      let torus:Torus = new Torus(this.context, 0.3, 0.1, 20, 20, (Primitive.ATTRIBUTE_USE_POSITION | Primitive.ATTRIBUTE_USE_NOMRAL));
      this.objList.push(torus);
      torus.attachShader(new DeferredGeometryPassShader(this.context));
      (<DeferredGeometryPassShader> torus.shader).color = 0x1000000 * Math.random();
      let r:number = 1.5 + Math.random() * 3;
      let theta:number = Math.random() * 360 * Main.RAD;
      torus.x = r * Math.cos(theta);
      torus.y = Math.random() * 3.5 - 1.5;
      torus.z = r * Math.sin(theta);
      torus.rotationX = Math.random() * 180 * Main.RAD;
      torus.rotationY = Math.random() * 180 * Main.RAD;
      this.torusList.push(torus);
      let rotationSpeedX:number = Math.random() * 0.08;
      rotationSpeedX -= rotationSpeedX > 0.04 ? 0.02 : 0.06;
      let rotationSpeedY:number = Math.random() * 0.08;
      rotationSpeedY -= rotationSpeedY > 0.04 ? 0.02 : 0.06;
      this.torusRotationList.push(rotationSpeedX, rotationSpeedY);
    }

    this.ambientLight = new DeferredAmbientLight(0x333333, 1.0);
    this.createPointLightList(10);

    this.camera = new Camera(45 * Main.RAD, Main.CANVAS_WIDTH / Main.CANVAS_HEIGHT, 1, 30.0);
    this.controller = new RoundCameraController(this.camera, this.canvas);
    this.canvas.style.cursor = "move";
    this.controller.radius = 10.0;
    this.controller.set(0, 60);
    //
    let textureTypeList:TextureTypeObject[] = [
      new TextureTypeObject(this.context.RGBA16F, this.context.RGBA, this.context.HALF_FLOAT),
      new TextureTypeObject(this.context.RGBA16F, this.context.RGBA, this.context.HALF_FLOAT),
      new TextureTypeObject(this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE),
      new TextureTypeObject(this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE)
    ];
    this.renderingTexture = new MultiRenderingTextureObject(this.context, 1024, 1024, textureTypeList);
    this.mrtScreenObject = new OrthoScreenObject(this.context);
    this.mrtScreenShader = new MRTScreenShader(this.context);
    this.mrtScreenShader.uniformList[0].matrix = this.mrtScreenObject.screenMatrix;
    this.mrtScreenShader.uniformList[1].value = 0;
    this.mrtScreenShader.uniformList[1].texture = this.renderingTexture.textureList[0];
    this.mrtScreenShader.uniformList[2].value = 1;
    this.mrtScreenShader.uniformList[2].texture = this.renderingTexture.textureList[1];
    this.mrtScreenShader.uniformList[3].value = 2;
    this.mrtScreenShader.uniformList[3].texture = this.renderingTexture.textureList[2];
    this.mrtScreenShader.uniformList[4].value = 3;
    this.mrtScreenShader.uniformList[4].texture = this.renderingTexture.textureList[3];
    this.mrtScreenShader.uniformList[5].vector4 = vec4.fromValues(1 / Main.CANVAS_WIDTH, 1 / Main.CANVAS_HEIGHT, 0.0, 0.0);
    this.mrtScreenObject.attachShader(this.mrtScreenShader);

    // ambient light
    DeferredAmbientLight.init(this.context);
    let ambientLightPassShader:DeferredAmbientLightPassShader = new DeferredAmbientLightPassShader(this.context);
    ambientLightPassShader.uniformList[0].matrix = DeferredAmbientLight.proxy.screenMatrix;
    ambientLightPassShader.uniformList[1].value = 2;
    ambientLightPassShader.uniformList[1].texture = this.renderingTexture.textureList[2];
    ambientLightPassShader.uniformList[2].vector4 = vec4.fromValues(1 / Main.CANVAS_WIDTH, 1 / Main.CANVAS_HEIGHT, 0.0, 0.0);
    ambientLightPassShader.uniformList[3].vector4 = vec4.fromValues(
      ((this.ambientLight.color >> 16) & 0xFF) / 255,
      ((this.ambientLight.color >> 8) & 0xFF) / 255,
      (this.ambientLight.color & 0xFF) / 255,
      1.0);
    ambientLightPassShader.uniformList[4].value = this.ambientLight.intensity;
    DeferredAmbientLight.proxy.attachShader(ambientLightPassShader);

    // point light
    DeferredPointLight.init(this.context);
    let pointLightPassShader:DeferredPointLightPassShader = new DeferredPointLightPassShader(this.context);
    pointLightPassShader.uniformList[1].value = 0;
    pointLightPassShader.uniformList[1].texture = this.renderingTexture.textureList[0];
    pointLightPassShader.uniformList[2].value = 1;
    pointLightPassShader.uniformList[2].texture = this.renderingTexture.textureList[1];
    pointLightPassShader.uniformList[3].value = 2;
    pointLightPassShader.uniformList[3].texture = this.renderingTexture.textureList[2];
    pointLightPassShader.uniformList[4].value = 3;
    pointLightPassShader.uniformList[4].texture = this.renderingTexture.textureList[3];
    pointLightPassShader.uniformList[5].vector4 = vec4.fromValues(1 / Main.CANVAS_WIDTH, 1 / Main.CANVAS_HEIGHT, 0.0, 0.0);
    DeferredPointLight.proxy.attachShader(pointLightPassShader);
    // point light Helper
    this.lightHelper = new Sphere(this.context, 1.0, 8, 8, Primitive.ATTRIBUTE_USE_POSITION);
    let lightHelperShader:PlainColorShader = new PlainColorShader(this.context);
    lightHelperShader.uniformList[1].value = 0;
    lightHelperShader.uniformList[1].texture = this.renderingTexture.textureList[3];
    lightHelperShader.uniformList[2].vector4 = vec4.fromValues(1 / Main.CANVAS_WIDTH, 1 / Main.CANVAS_HEIGHT, 0.0, 0.0);
    this.lightHelper.attachShader(lightHelperShader);
    //
    this.render();
  }

  private render():void
  {
    this.stats.begin();
    //
    this.frame += 1;

    let torusLength:number = this.torusList.length;
    for (let i:number = 0; i < torusLength; i++)
    {
      let torus:Torus = this.torusList[i];
      torus.rotationX += this.torusRotationList[i * 2];
      torus.rotationY += this.torusRotationList[i * 2 + 1];
    }
    //
    /*
     if (!this.controller.isMouseDown)
     {
     this.controller.rotate(0.5, 0.0);
     this.controller.upDate(1.0);
     }
     else
     {
     this.controller.upDate(0.1);
     }
     */
    this.controller.upDate(0.1);

    let mMatrix:mat4 = mat4.identity(mat4.create());
    let mvpMatrix:mat4 = mat4.identity(mat4.create());

    mat4.multiply(mvpMatrix, this.camera.getCameraMtx(), mMatrix);

    //
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.renderingTexture.frameBuffer);
    this.context.viewport(0, 0, this.renderingTexture.width, this.renderingTexture.height);
    this.context.disable(this.context.BLEND);
    this.context.depthMask(true);
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    //
    // objList内のobjectを描画
    let cameraMatrix:mat4 = this.camera.getCameraMtx();
    let objectMVPMatrix:mat4 = mat4.create();
    let length:number = this.objList.length;
    for (let i:number = 0; i < length; i++)
    {
      let obj:SceneObject = this.objList[i];
      let objMMatrix:mat4 = obj.getModelMtx();

      mat4.multiply(objectMVPMatrix, cameraMatrix, objMMatrix);

      obj.shader.getUniform("mvpMatrix").matrix = objectMVPMatrix;
      if (obj.shader instanceof DeferredGeometryPassShader)
      {
        obj.shader.getUniform("modelMatrix").matrix = objMMatrix;
      }
      obj.shader.bindShader();
      obj.bindVertexbuffer();
      obj.bindIndexbuffer();
      this.context.drawElements(this.context.TRIANGLES, obj.iboData.length, this.context.UNSIGNED_SHORT, 0);
    }
    //
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    this.context.viewport(0, 0, Main.CANVAS_WIDTH, Main.CANVAS_HEIGHT);
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.ONE, this.context.ONE);
    this.context.depthMask(false);
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

    if (!this.showGbuffer)
    {
      // ambient light
      let ambientProxy:OrthoScreenObject = DeferredAmbientLight.proxy;
      ambientProxy.shader.bindShader();
      ambientProxy.bindVertexbuffer();
      ambientProxy.bindIndexbuffer();
      this.context.drawElements(this.context.TRIANGLES, ambientProxy.iboData.length, this.context.UNSIGNED_SHORT, 0);

      // point light update
      switch (this.lightMovementType)
      {
        case GUIPanel.MOVEMENT_TYPE_WAVE:
        {
          this.pointLightUpdateWave();
          break;
        }
        case GUIPanel.MOVEMENT_TYPE_SPIRAL:
        {
          this.pointLightUpdateSpiral();
          break;
        }
        case GUIPanel.MOVEMENT_TYPE_RANDOM:
        {
          TWEEN.update();
          break;
        }
        case GUIPanel.MOVEMENT_TYPE_NONE:
        default:
        {
          break;
        }
      }
      // point light
      let lightLength:number = this.lightList.length;
      for (let i:number = 0; i < lightLength; i++)
      {
        let light:DeferredPointLight = this.lightList[i];
        let proxy:SceneObject = DeferredPointLight.proxy;
        proxy.x = light.x;
        proxy.y = light.y;
        proxy.z = light.z;
        proxy.scaleX = light.distance;
        proxy.scaleY = light.distance;
        proxy.scaleZ = light.distance;
        let lightMMatrix:mat4 = proxy.getModelMtx();

        mat4.multiply(objectMVPMatrix, cameraMatrix, lightMMatrix);

        proxy.shader.getUniform("mvpMatrix").matrix = objectMVPMatrix;
        proxy.shader.uniformList[6].vector3 = vec3.fromValues(light.x, light.y, light.z);
        proxy.shader.uniformList[7].vector4 = light.colorVec;
        proxy.shader.uniformList[8].value = light.intensity;
        proxy.shader.uniformList[9].value = light.distance;
        proxy.shader.uniformList[10].value = light.attenuation;

        proxy.shader.bindShader();
        proxy.bindVertexbuffer();
        proxy.bindIndexbuffer();
        this.context.drawElements(this.context.TRIANGLES, proxy.iboData.length, this.context.UNSIGNED_SHORT, 0);
      }
      //
      if (this.useLightHelper)
      {
        this.context.blendFunc(this.context.ONE, this.context.ZERO);
        //
        for (let i:number = 0; i < lightLength; i++)
        {
          let light:DeferredPointLight = this.lightList[i];
          //
          let helper:Sphere = this.lightHelper;
          helper.x = light.x;
          helper.y = light.y;
          helper.z = light.z;
          helper.scaleX = 0.05;
          helper.scaleY = 0.05;
          helper.scaleZ = 0.05;
          let lightMMatrix:mat4 = helper.getModelMtx();

          mat4.multiply(objectMVPMatrix, cameraMatrix, lightMMatrix);

          helper.shader.getUniform("mvpMatrix").matrix = objectMVPMatrix;
          helper.shader.uniformList[3].vector4 = light.data.helperColorVec;

          helper.shader.bindShader();
          helper.bindVertexbuffer();
          helper.bindIndexbuffer();
          this.context.drawElements(this.context.TRIANGLES, helper.iboData.length, this.context.UNSIGNED_SHORT, 0);
        }
      }
    }
    else
    {
      this.mrtScreenShader.bindShader();
      this.mrtScreenObject.bindVertexbuffer();
      this.mrtScreenObject.bindIndexbuffer();
      this.context.drawElements(this.context.TRIANGLES, this.mrtScreenObject.iboData.length, this.context.UNSIGNED_SHORT, 0);
    }
    //
    this.context.flush();

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }

  private createPointLightList(numPointLights:number):void
  {
    if (this.lightList)
    {
      this.lightList = [];
    }

    for (let i:number = 0; i < numPointLights; i++)
    {
      let hue:number = 360 / numPointLights * i;
      let helperColor:RGB = RGB.createFromHSV(hue, 0.8, 0.6);
      let dataObj:any = {"helperColorVec":vec4.fromValues(helperColor.r, helperColor.g, helperColor.b, 1.0)};
      let light:DeferredPointLight = new DeferredPointLight(RGB.getValue(RGB.createFromHSV(hue, 1, 1)), 1.0, 3.0, 2.0, dataObj);
      this.lightList.push(light);
      light.x = (Math.random() - 0.5) * 8;
      light.y = Math.random() * 4;
      light.z = (Math.random() - 0.5) * 8;
    }
  }

  private pointLightUpdateWave():void
  {
    let lightLength:number = this.lightList.length;
    let time:number = this.frame / 10;
    let phaseSfitFactor:number = Math.PI * 2 / lightLength;
    for (let i:number = 0; i < lightLength; i++)
    {
      let light:DeferredPointLight = this.lightList[i];
      let theta:number = 360 / lightLength * i * Main.RAD;
      light.x = 3 * Math.cos(theta);
      light.y = Math.cos(time + phaseSfitFactor * i);
      light.z = 3 * Math.sin(theta);
    }
  }

  private pointLightUpdateSpiral():void
  {
    let lightLength:number = this.lightList.length;
    let time:number = this.frame / 20;
    let time2:number = this.frame / 40;
    let time3:number = this.frame / 50;
    for (let i:number = 0; i < lightLength; i++)
    {
      let light:DeferredPointLight = this.lightList[i];
      let theta:number = 360 / lightLength * i * Main.RAD;
      let r:number = 2 * (Math.cos(time2 + 0.05 * i) + 1.5);
      light.x = r * Math.cos(time + theta);
      light.y = Math.cos(time3 + 0.05 * i);
      light.z = r * Math.sin(time + theta);
    }
  }

  private pointLightUpdateRandom():void
  {
    TWEEN.removeAll();

    let lightLength:number = this.lightList.length;
    for (let i:number = 0; i < lightLength; i++)
    {
      let light:DeferredPointLight = this.lightList[i];
      this.getTween(light);
    }
  }

  private getTween(target:any):Tween
  {
    let targetX:number = (Math.random() - 0.5) * 8;
    let targetY:number = Math.random() * 4 - 2;
    let targetZ:number = (Math.random() - 0.5) * 8;
    let delay:number = 200 + Math.random() * 600;
    let time:number = 1500 + Math.random() * 2000;
    return new Tween(target)
      .to({x:targetX, y:targetY, z:targetZ}, time)
      .delay(delay)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onComplete(() =>
      {
        this.getTween(target);
      })
      .start();
  }
}

window.addEventListener(EventName.DOM_CONTENT_LOADED, () => new Main());
