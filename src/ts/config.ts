import { BoxConfig } from "./types";
import { canvas } from "./globals";
import { Box } from "./box";
import { copyStringToClipboard } from "./utils";
import {
  defaultCanvasWidth, defaultCanvasHeight, defaultCanvasStyleWidth,
  defaultCanvasStyleHeight, defaultTextureTone,
  LoadConfigFromFile, defaultCountx, defaultCounty, defaultAnimationSpeed,
  PrintConfigData, defaultType1BoxRatio, defaultType2BoxRatio, randomizeDelay,
  DefaultDisplayPoints,
  NearestNeighborDepth,
  ShowWozawskiEye,
  TopEyes,
  RandomizeBounce,
  SynchronizeBounces,
  BounceX,
  Animate,
  GlobalMovement,
  RandomizeMovment,
  RandomizeScale,
} from "./constants";

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

  type1BoxRatio: number;
  type2BoxRatio: number;
  randomizeDelay: number;
  NearestNeighborDepth: number;

  PrintConfigData: boolean;
  displayPoints: boolean;
  ShowWozawskiEye: boolean;
  TopEyes: boolean;
  RandomizeBounce: boolean;
  SynchronizeBounces: boolean;
  BounceX: boolean;
  Animate: boolean;
  GlobalMovement: boolean;
  RandomizeMovment: boolean;
  RandomizeScale: boolean;
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

  type1BoxRatio: number;
  type2BoxRatio: number;
  randomizeDelay: number;
  NearestNeighborDepth: number;

  PrintConfigData: boolean;
  displayPoints: boolean;
  ShowWozawskiEye: boolean;
  TopEyes: boolean;
  RandomizeBounce: boolean;
  SynchronizeBounces: boolean;
  BounceX: boolean;
  Animate: boolean;
  GlobalMovement: boolean;
  RandomizeMovment: boolean;
  RandomizeScale: boolean;

  //NON JSONIFYABLE PROPETIES
  w: number;
  h: number;
  max_d: number;
  boxes: Array<Array<Box>>;

  static _instance: Configuration;

  private constructor() {
    canvas.width = defaultCanvasWidth;
    canvas.height = defaultCanvasHeight;
    canvas.style.width = defaultCanvasStyleWidth;
    canvas.style.height = defaultCanvasStyleHeight;
    this.w = canvas.width;
    this.h = canvas.height;
    this.countx = defaultCountx;
    this.county = defaultCounty;
    this.dx = this.w / this.countx;
    this.dy = this.h / this.county;
    this.max_d = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.animationSpeed = defaultAnimationSpeed;
    this.boxes = new Array<Array<Box>>();
    this.textureTone = defaultTextureTone;

    this.type1BoxRatio = defaultType1BoxRatio;
    this.type2BoxRatio = defaultType2BoxRatio;

    this.randomizeDelay = randomizeDelay;
    this.PrintConfigData = PrintConfigData;
    this.NearestNeighborDepth = NearestNeighborDepth;
    this.displayPoints = DefaultDisplayPoints;
    this.ShowWozawskiEye = ShowWozawskiEye;
    this.TopEyes = TopEyes;
    this.RandomizeBounce = RandomizeBounce;
    this.SynchronizeBounces = SynchronizeBounces;
    this.BounceX = BounceX;
    this.Animate = Animate;
    this.GlobalMovement = GlobalMovement;
    this.RandomizeMovment = RandomizeMovment;
    this.RandomizeScale = RandomizeScale;
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
  

    this.type1BoxRatio = configJson.type1BoxRatio || 0.5;
    this.type2BoxRatio = configJson.type1BoxRatio || 0.5;
    this.randomizeDelay = configJson.randomizeDelay || 4000;
    this.PrintConfigData = configJson.PrintConfigData || false;
    this.NearestNeighborDepth = configJson.NearestNeighborDepth || 1;
    this.displayPoints = configJson.DefaultDisplayPoints || false;
    this.ShowWozawskiEye = configJson.ShowWozawskiEye || false;
    this.TopEyes = configJson.TopEyes || false;
    this.RandomizeBounce = configJson.RandomizeBounce || false;
    this.SynchronizeBounces = configJson.SynchronizeBounces || true;
    this.BounceX = configJson.BounceX || false;
    this.Animate = configJson.Animate || false;
    this.GlobalMovement = configJson.GlobalMovement || false;
    this.RandomizeMovment = configJson.RandomizeMovment || false;
    this.RandomizeScale = configJson.RandomizeScale || false;

    console.log("AFTER LOADING CONFIGJSON", this.GlobalMovement);

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
      width: this.w,
      height: this.h,
      styleWidth: canvas.style.width,
      styleHeight: canvas.style.height,
      countx: this.countx,
      county: this.county,
      dx: this.dx,
      dy: this.dy,
      animationSpeed: this.animationSpeed,
      textureTone: this.textureTone,
      boxes: configBoxes,
      type1BoxRatio: this.type1BoxRatio,
      type2BoxRatio: this.type2BoxRatio,
      randomizeDelay: this.randomizeDelay,
      PrintConfigData: this.PrintConfigData,
      NearestNeighborDepth: this.NearestNeighborDepth,
      displayPoints: this.displayPoints,
      ShowWozawskiEye: this.ShowWozawskiEye,
      TopEyes: this.TopEyes,
      RandomizeBounce: this.RandomizeBounce,
      SynchronizeBounces: this.SynchronizeBounces,
      BounceX: this.BounceX,
      Animate: this.Animate,
      GlobalMovement: this.GlobalMovement,
      RandomizeMovment: this.RandomizeMovment,
      RandomizeScale: this.RandomizeScale,
    }

    if (PrintConfigData) {
      copyStringToClipboard(JSON.stringify(output));
      console.log(JSON.stringify(output));
    }
  }
}

export const config = Configuration.getConfig();
