var fromConfig;

// import * as config from "../configs/14.json";
// fromConfig = true;
fromConfig = false;
import { copyStringToClipboard } from "./utils";
var canvas: HTMLCanvasElement = document.querySelector("#clouds");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
canvas.style.width = "100vw";
canvas.style.height = "100vh";
var w = canvas.width;
var h = canvas.height;
var countx = 2;
var county = 2;
// var county = Math.floor(canvas.height / canvas.width) * countx;
var dx = w / countx;
var dy = h / county;
var max_d = Math.sqrt(dx * dx + dy * dy);
var animationSpeed = 1000 / 24;
var boxes: Array<Array<Box>>;
var textureTone;
// textureTone = "#693f3a";
textureTone = "#a1665e"; // most used setting
// textureTone = "#8E4B32";
// textureTone = "#444444"; // black and white, greyish
// textureTone = "#ecbcb4";
// textureTone = "#80afb5";

class Configuration {
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

function loadConfig(config) {
  canvas.width = config.width;
  canvas.height = config.height;
  w = canvas.width;
  h = canvas.height;
  if (config.styleWidth) canvas.style.width = config.styleWidth;
  if (config.styleHeight) canvas.style.height = config.styleHeight;
  countx = config.county;
  county = config.county;
  dx = w / countx;
  dy = h / county;
  max_d = Math.sqrt(dx * dx + dy * dy);
  animationSpeed = config.animationSpeed;
  textureTone = config.textureTone;
  boxes = [];
  for (let boxconfigArray of config.boxes) {
    let boxesArray = new Array<Box>();
    for (let boxconfig of boxconfigArray) {
      let box = Box.fromConfig(boxconfig);
      boxesArray.push(box);
    }
    boxes.push(boxesArray);
  }
}

type coords = {
  x: number,
  y: number
}

class PointConfig {
  x: number;
  y: number;
  scale: number;
}

class Point {
  x: number;
  y: number;
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
  scale: number;
  scale2: number;
  velocity: boolean = true;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    // this.scale = 0.8 + Math.random()*0.2;
    this.scale = 1;
    this.scale2 = 1;
  }

  getConfig(): PointConfig {
    return {
      x: this.x,
      y: this.y,
      scale: this.scale
    }
  }

  static fromConfig(config: PointConfig): Point {
    let point = new Point(config.x, config.y);
    point.scale = config.scale;
    return point;
  }

  render(radius = 2) {
    ctx.fillStyle = "#6d6875ff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  animate(value = (1 / animationSpeed)) {
    this.scale -= (this.velocity) ? value : -value;
    if (this.scale <= 0.8)
      this.velocity = false;
    else if (this.scale >= 1)
      this.velocity = true;

    // value = 200*value;
    // this.y -= (this.velocity) ? value : -value;
  }

  animate2(value = (1 / animationSpeed)) {
    this.scale2 -= (this.velocity) ? value : -value;
    if (this.scale2 <= 0.8)
      this.velocity = false;
    else if (this.scale2 >= 1)
      this.velocity = true;

    value = 200*value;
    this.y -= (this.velocity) ? value : -value;
  }

  distanceTo(point: coords) {
    return this.scale * (Dist2d(this, point));
  }
}

class BoxConfig {
  i: number;
  j: number;
  x: number;
  y: number;
  point: PointConfig;
}

class Box {
  i: number;
  j: number;
  x: number;
  y: number;
  point: Point;

  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.x = i * dx;
    this.y = j * dy;
    this.assignNewRandomPoint();
  }

  assignNewRandomPoint() {
    this.point = new Point(this.x + dx * Math.random(), this.y + dy * Math.random())
    // this.point.scale = 0.5 + (1 - this.j)*0.1;
  }

  getConfig(): BoxConfig {
    return {
      i: this.i,
      j: this.j,
      x: this.x,
      y: this.y,
      point: this.point.getConfig()
    }
  }

  static fromConfig(config: BoxConfig): Box {
    let box = new Box(config.i, config.j);
    box.point = Point.fromConfig(config.point);
    return box;
  }

  render(lineWidth = 0.1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#05668dff";
    ctx.strokeRect(this.x, this.y, dx, dy);
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function RenderWorleyNoise(inputColor: string = "#ffcdb2") {
  let rgb = hexToRgb(inputColor);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i = i + 4) {
    let point = get2dCoords(i);
    let dist = getNearestDistance(point, boxes);
    let opacity = (dist / (max_d));
    opacity = 1 - opacity;
    opacity = Math.pow(opacity, 1.4);
    // if (point.y < h / 2) {
    //   if (opacity > 0.98)
    //     opacity = 1 - opacity * 0.4
    //   else if (opacity > 0.93)
    //     opacity = 1 - opacity * 0.2
    // }

    data[i + 0] = rgb.r * opacity;
    data[i + 1] = rgb.g * opacity;
    data[i + 2] = rgb.b * opacity;
  }
  ctx.putImageData(imageData, 0, 0);
}

function getCurrentBox(point: coords, boxes) {
  let i = Math.floor(point.x / dx);
  let j = Math.floor(point.y / dy);
  return {
    i,
    j,
    box: boxes[i][j]
  }
}

function Dist2d(point1: coords, point2: coords) {
  let dx = point1.x - point2.x;
  let dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy)
}

function getNearestDistance(point: coords, boxes: Array<Array<Box>>) {
  let data = getCurrentBox(point, boxes);
  let box = data.box
  let bounding_boxes = new Array<Box>();
  for (let shiftx = -1; shiftx < 2; shiftx++) {
    for (let shifty = -1; shifty < 2; shifty++) {
      let i = data.i + shiftx;
      let j = data.j + shifty;
      if (i > -1 && i < countx && j > -1 && j < county)
        bounding_boxes.push(boxes[i][j]);
    }
  }
  let min = 2 * max_d;
  for (let box of bounding_boxes) {
    let dist = box.point.distanceTo(point);
    min = Math.min(dist, min);
  }
  return min;
  // console.log(point, data.i, data.j, boxPoint.x , boxPoint.y);
}

function get2dCoords(i) {
  i = Math.floor(i / 4);
  let y = Math.floor(i / w);
  let x = Math.floor(i % w);
  return {
    x,
    y
  }
}

function generateBoxes() {
  let boxes = new Array<Array<Box>>();
  for (let i = 0; i < countx; i++) {
    let boxArray = new Array();
    for (let j = 0; j < county; j++) {
      let box = new Box(i, j);
      boxArray.push(box);
    }
    boxes.push(boxArray);
  }
  return boxes;
}

function renderPoints(boxes: Array<any>) {
  for (let i = 0; i < boxes.length; i++) {
    let boxArray = boxes[i];
    for (let j = 0; j < boxArray.length; j++) {
      let box = boxArray[j];
      // console.log(box);
      box.render();
      box.point.render();
    }
  }
}

function init(config?: Configuration) {
  if (config) {
    loadConfig(config);
  } else {
    boxes = generateBoxes();
  }
  clearScreen();
  // renderPoints(boxes);
  generateConfig();
  animate();
  setInterval(() => {
    generateRandom();
  }, 4000)
}

function clearScreen() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#e5989bff"
  ctx.fillRect(0, 0, w, h);
}

function RandomizePoints() {
  for (let boxArray of boxes)
    for (let box of boxArray)
      box.assignNewRandomPoint();
  renderPoints(boxes);
};
// good results;
// textureTone = "#693f3a" // decent results too

function animate() {
  clearScreen();
  boxes[0][1].point.animate();
  boxes[1][1].point.animate();
  boxes[0][0].point.animate2();
  boxes[1][0].point.animate2();
  RenderWorleyNoise(textureTone);
  requestAnimationFrame(animate);
}

function generateRandom() {
  clearScreen();
  RandomizePoints();
  RenderWorleyNoise(textureTone);
  generateConfig();
  // renderPoints(boxes);
}

function generateConfig() {
  let configBoxes = new Array<Array<BoxConfig>>();
  for (let boxArray of boxes) {
    let configBoxesArray = new Array<BoxConfig>();
    for (let box of boxArray) {
      configBoxesArray.push(box.getConfig());
    }
    configBoxes.push(configBoxesArray);
  }
  let config: Configuration = {
    width: w,
    height: h,
    styleWidth: canvas.style.width,
    styleHeight: canvas.style.height,
    countx,
    county,
    dx,
    dy,
    animationSpeed,
    textureTone,
    boxes: configBoxes
  }
  copyStringToClipboard(JSON.stringify(config));
  console.log(JSON.stringify(config));
  return config;
}

function loadConfigFromFile(fileName) {
}


(<any>window).RenderWorleyNoise = RenderWorleyNoise;
(<any>window).RandomizePoints = RandomizePoints;
(<any>window).animate = animate;
(<any>window).generateRandom = generateRandom;
(<any>window).loadConfigFromFile = loadConfigFromFile;

// if (fromConfig)
// init(config)
// else
init()
