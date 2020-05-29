var fromConfig;
import * as configFile from "../configs/14.json";
// import * as config from "../configs/14.json";
// fromConfig = true;
fromConfig = false;
import { hexToRgb } from "./utils";
import { coords, BoxConfig } from "./types";
import { Box } from "./box";
import { config } from "./config";
import { canvas, ctx } from "./globals";
import { HumanSkinTones } from "./colors";
import {
  LoadConfigFromFile,
  defaultType1BoxRatio,
  defaultType2BoxRatio,
  randomizeDelay,
  NearestNeighborDepth,
  DefaultDisplayPoints,
  ShowWozawskiEye
} from "./constants";

var displayPoints = DefaultDisplayPoints;
var showeyes = ShowWozawskiEye;

function RenderWorleyNoise(inputColor: string = HumanSkinTones.blackandwhite) {
  let rgb = hexToRgb(inputColor);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i = i + 4) {
    let point = get2dCoords(i);
    const {dist, box} = getNearestDistance(point, config.boxes);
    let opacity = (dist / (config.max_d));
    opacity = 1 - opacity;
    opacity = Math.pow(opacity, 1.7);
    // if (point.y < (config.h / 2)) {
    if (showeyes || box.hasEye) {
      if (opacity > 0.97)
        opacity = 1 - opacity * 0.5
      else if (opacity > 0.90)
        opacity = 1 - opacity * 0.3
      else if (opacity > 0.85)
        opacity = 1 - opacity * 0.2
    }
    // }

    data[i + 0] = rgb.r * opacity;
    data[i + 1] = rgb.g * opacity;
    data[i + 2] = rgb.b * opacity;
  }
  ctx.putImageData(imageData, 0, 0);
}

function getCurrentBox(point: coords, boxes) {
  let i = Math.floor(point.x / config.dx);
  let j = Math.floor(point.y / config.dy);
  return {
    i,
    j,
    box: boxes[i][j]
  }
}

function getNearestDistance(point: coords, boxes: Array<Array<Box>>): {
  dist: number,
  box: Box
} {
  let data = getCurrentBox(point, boxes);
  let box = data.box
  let bounding_boxes = new Array<Box>();
  let start = -NearestNeighborDepth;
  let end = +NearestNeighborDepth;
  for (let shiftx = start; shiftx <= end; shiftx++) {
    for (let shifty = start; shifty <= end; shifty++) {
      let i = data.i + shiftx;
      let j = data.j + shifty;
      if (i > -1 && i < config.countx && j > -1 && j < config.county)
        bounding_boxes.push(boxes[i][j]);
    }
  }
  let min = 2 * config.max_d;
  let minBox = data.box;
  for (let box of bounding_boxes) {
    let dist = box.point.distanceTo(point);
    min = Math.min(dist, min);
    minBox = box;
  }
  return {
    dist: min,
    box: box
  }
  // console.log(point, data.i, data.j, boxPoint.x , boxPoint.y);
}

function get2dCoords(i) {
  i = Math.floor(i / 4);
  // y flows down
  // x flows right
  let y = Math.floor(i / config.w);
  let x = Math.floor(i % config.w);
  return {
    x,
    y
  }
}

function generateBoxes() {
  let boxes = new Array<Array<Box>>();
  for (let i = 0; i < config.countx; i++) {
    let boxArray = new Array();
    for (let j = 0; j < config.county; j++) {
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

function linearTo2d(i, rows, cols) {
  return {
    x: Math.floor(i % cols),
    y: Math.floor(i / cols)
  }
}

function getBoxLinear(i): Box {
  let indices = linearTo2d(i, config.countx, config.county);
  // console.log(i, indices);
  return config.boxes[indices.x][indices.y];
}

function init() {
  config.boxes = generateBoxes();
  clearScreen();
  config.generateConfig();
  if (LoadConfigFromFile) {
    config.updateFromConfig(configFile)
  }

  const { type1Boxes, type2Boxes } = generateRandomTypeBoxes();
  animate(type1Boxes, type2Boxes);
  setInterval(() => {
    generateRandom();
  }, randomizeDelay)
}

function generateRandomTypeBoxes(): {
  type1Boxes: Array<Box>,
  type2Boxes: Array<Box>
} {
  let type1Boxes = new Array<Box>();
  let type2Boxes = new Array<Box>();
  if (config.county == 2 && config.county == 2) {
    type1Boxes.push(getBoxLinear(2));
    type1Boxes.push(getBoxLinear(3));
    type2Boxes.push(getBoxLinear(0));
    type2Boxes.push(getBoxLinear(1));
    return {
      type1Boxes,
      type2Boxes
    }
  }
  let totalCount = config.countx * config.county;
  console.log("randomizing", defaultType1BoxRatio, defaultType2BoxRatio)
  for (let i = 0; i < totalCount; i++) {
    if (Math.random() < defaultType1BoxRatio)
      type1Boxes.push(getBoxLinear(i));
  }
  for (let i = 0; i < totalCount; i++) {
    if (Math.random() < defaultType2BoxRatio)
      type2Boxes.push(getBoxLinear(i));
  }
  console.log("typ1 and typ2 count", type1Boxes.length, type2Boxes.length);
  return {
    type1Boxes,
    type2Boxes
  }
}

function clearScreen() {
  ctx.clearRect(0, 0, config.w, config.h);
  ctx.fillStyle = "#e5989bff"
  ctx.fillRect(0, 0, config.w, config.h);
}

function RandomizePoints() {
  for (let boxArray of config.boxes)
    for (let box of boxArray)
      box.assignNewRandomPoint();
  renderPoints(config.boxes);
};

function animate(type1Boxes: Array<Box>, type2Boxes: Array<Box>) {
  clearScreen();
  for (let box of type1Boxes)
    box.point.animate();
  for (let box of type2Boxes)
    box.point.animate2();
  if (displayPoints)
    renderPoints(config.boxes);
  else
    RenderWorleyNoise(config.textureTone);
  requestAnimationFrame(animate.bind(this, type1Boxes, type2Boxes));
}

function generateRandom() {
  clearScreen();
  RandomizePoints();
  RenderWorleyNoise(config.textureTone);
  config.generateConfig();
  // renderPoints(boxes);
}

function toggle() {
  displayPoints = !displayPoints;
}

function eyes() {
  showeyes = !showeyes;
}

(<any>window).RenderWorleyNoise = RenderWorleyNoise;
(<any>window).RandomizePoints = RandomizePoints;
(<any>window).animate = animate;
(<any>window).generateRandom = generateRandom;
(<any>window).toggle = toggle;
(<any>window).eyes = eyes;

// if (fromConfig)
// init(config)
// else
init()
