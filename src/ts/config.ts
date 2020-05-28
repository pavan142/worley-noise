import { BoxConfig } from "./types";
import { canvas } from "./globals";
import { Box } from "./box";
import { copyStringToClipboard } from "./utils";

class JSONConfiguration {
  width: number;
  height: number;
  countx: number;
  county: number;
  styleWidth: string;
  styleHeight: string;
  dx: number;
  dy: number;
  animationSpeed: number;
  textureTone: string;
  boxes: Array<Array<BoxConfig>>;
}

class Configuration {
  // JSONSIFYIABLE PROPERTIES
  width: number;
  height: number;
  countx: number;
  county: number;
  styleWidth: string;
  styleHeight: string;
  dx: number;
  dy: number;
  animationSpeed: number;
  textureTone: string;
  boxesConfig: Array<Array<BoxConfig>>;

  //NON JSONIFYABLE PROPETIES
  w: number;
  h: number;
  max_d: number;
  boxes: Array<Array<Box>>;

  static _instance: Configuration;

  private constructor() {
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    this.w = canvas.width;
    this.h = canvas.height;
    this.countx = 2;
    this.county = 2;
    // this.county = Math.floor(canvas.height / canvas.width) * countx;
    this.dx = this.w / this.countx;
    this.dy = this.h / this.county;
    this.max_d = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.animationSpeed = 1000 / 24;
    this.boxes = new Array<Array<Box>>();
    this.textureTone;
    // textureTone = "#693f3a";
    this.textureTone = "#a1665e"; // most used setting
    // textureTone = "#8E4B32";
    // textureTone = "#444444"; // black and white, greyish
    // textureTone = "#ecbcb4";
    // textureTone = "#80afb5";
  }

  static getConfig(): Configuration {
    return Configuration._instance || (Configuration._instance = new Configuration());
  }

  updateFromConfig(configJson) {
    canvas.width = configJson.width;
    canvas.height = configJson.height;
    this.w = canvas.width;
    this.h = canvas.height;
    if (configJson.styleWidth) canvas.style.width = configJson.styleWidth;
    if (configJson.styleHeight) canvas.style.height = configJson.styleHeight;
    this.countx = configJson.county;
    this.county = configJson.county;
    this.dx = this.w / this.countx;
    this.dy = this.h / this.county;
    this.max_d = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.animationSpeed = configJson.animationSpeed;
    this.textureTone = configJson.textureTone;
    this.boxes = [];
    for (let boxconfigArray of configJson.boxes) {
      let boxesArray = new Array<Box>();
      for (let boxconfig of boxconfigArray) {
        let box = Box.fromConfig(boxconfig);
        boxesArray.push(box);
      }
      this.boxes.push(boxesArray);
    }
  }

  generateConfig(): void {
    let configBoxes = new Array<Array<BoxConfig>>();
    for (let boxArray of this.boxes) {
      let configBoxesArray = new Array<BoxConfig>();
      for (let box of boxArray) {
        configBoxesArray.push(box.getConfig());
      }
      configBoxes.push(configBoxesArray);
    }
    let output: JSONConfiguration = {
      width: config.w,
      height: config.h,
      styleWidth: canvas.style.width,
      styleHeight: canvas.style.height,
      countx: config.countx,
      county: config.county,
      dx: config.dx,
      dy: config.dy,
      animationSpeed: config.animationSpeed,
      textureTone: config.textureTone,
      boxes: configBoxes
    }
    copyStringToClipboard(JSON.stringify(config));
    console.log(JSON.stringify(config));
  }
}

export const config = Configuration.getConfig();
