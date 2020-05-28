var fromConfig;

// import * as config from "../configs/14.json";
// fromConfig = true;
fromConfig = false;
import { copyStringToClipboard, hexToRgb } from "./utils";
import { coords, BoxConfig } from "./types";
import { Box } from "./box";
import { config } from "./config";
import { canvas, ctx } from "./globals";
canvas.width = 800;
canvas.height = 600;
canvas.style.width = "100vw";
canvas.style.height = "100vh";
// var county = Math.floor(canvas.height / canvas.width) * countx;
// textureTone = "#693f3a";
config.textureTone = "#a1665e"; // most used setting
// textureTone = "#8E4B32";
// textureTone = "#444444"; // black and white, greyish
// textureTone = "#ecbcb4";
// textureTone = "#80afb5";
function RenderWorleyNoise(inputColor: string = "#ffcdb2") {
  let rgb = hexToRgb(inputColor);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i = i + 4) {
    let point = get2dCoords(i);
    let dist = getNearestDistance(point, config.boxes);
    let opacity = (dist / (config.max_d));
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
  let i = Math.floor(point.x / config.dx);
  let j = Math.floor(point.y / config.dy);
  return {
    i,
    j,
    box: boxes[i][j]
  }
}

function getNearestDistance(point: coords, boxes: Array<Array<Box>>) {
  let data = getCurrentBox(point, boxes);
  let box = data.box
  let bounding_boxes = new Array<Box>();
  for (let shiftx = -1; shiftx < 2; shiftx++) {
    for (let shifty = -1; shifty < 2; shifty++) {
      let i = data.i + shiftx;
      let j = data.j + shifty;
      if (i > -1 && i < config.countx && j > -1 && j < config.county)
        bounding_boxes.push(boxes[i][j]);
    }
  }
  let min = 2 * config.max_d;
  for (let box of bounding_boxes) {
    let dist = box.point.distanceTo(point);
    min = Math.min(dist, min);
  }
  return min;
  // console.log(point, data.i, data.j, boxPoint.x , boxPoint.y);
}

function get2dCoords(i) {
  i = Math.floor(i / 4);
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

function init() {
  // if (config) {
  //   loadConfig(config);
  // } else {
  config.boxes = generateBoxes();
  clearScreen();
  // renderPoints(boxes);
  config.generateConfig();
  animate();
  setInterval(() => {
    generateRandom();
  }, 4000)
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
// good results;
// textureTone = "#693f3a" // decent results too

function animate() {
  clearScreen();
  config.boxes[0][1].point.animate();
  config.boxes[1][1].point.animate();
  config.boxes[0][0].point.animate2();
  config.boxes[1][0].point.animate2();
  RenderWorleyNoise(config.textureTone);
  requestAnimationFrame(animate);
}

function generateRandom() {
  clearScreen();
  RandomizePoints();
  RenderWorleyNoise(config.textureTone);
  config.generateConfig();
  // renderPoints(boxes);
}



(<any>window).RenderWorleyNoise = RenderWorleyNoise;
(<any>window).RandomizePoints = RandomizePoints;
(<any>window).animate = animate;
(<any>window).generateRandom = generateRandom;

// if (fromConfig)
// init(config)
// else
init()
