import {GUI} from "dat-gui";
/**
 * @author Kentaro Kawakatsu
 */
export class GUIPanel
{
  public static MOVEMENT_TYPE_WAVE:string = "wave";
  public static MOVEMENT_TYPE_SPIRAL:string = "spiral";
  public static MOVEMENT_TYPE_RANDOM:string = "random";
  public static MOVEMENT_TYPE_NONE:string = "none";
  public static MOVEMENT_LIST:string[] = [
    GUIPanel.MOVEMENT_TYPE_WAVE,
    GUIPanel.MOVEMENT_TYPE_SPIRAL,
    GUIPanel.MOVEMENT_TYPE_RANDOM,
    GUIPanel.MOVEMENT_TYPE_NONE];

  public gbuffer:Boolean;
  public num:number;
  public helper:Boolean;
  public movement:string;

  constructor()
  {
    this.gbuffer = false;
    this.num = 10;
    this.helper = false;
    this.movement = GUIPanel.MOVEMENT_LIST[0];
  }

  public setGUITitle(gui:GUI, propertyName:string, title:string)
  {
    let propertyList:NodeListOf<Element> = gui.domElement.getElementsByClassName("property-name");
    let length:number = propertyList.length;
    for (let i:number = 0; i < length; i++)
    {
      let element:Element = propertyList[i];
      if (element.innerHTML === propertyName)
      {
        element.innerHTML = title;
      }
    }
  }
}
