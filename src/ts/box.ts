import { Point } from "./point";
import { BoxConfig } from "./types";
import { config } from "./config";
import { ctx } from "./globals";
import { TopEyes } from "./constants";

export class Box {
  i: number;
  j: number;
  x: number;
  y: number;
  point: Point;
  hasEye: boolean = false;

  constructor(i, j) {
    this.i = i;
    this.j = j;

    // This assignment makes x flow down and y flow right in the boxes matrix
    this.x = i * config.dx;
    this.y = j * config.dy;
  

    if (TopEyes) {
      this.hasEye = (j == 0)
    }

    // this.hasEye = Math.random() < 0.3;
    // This assignment makes x flow right and y flow down in the boxes matrix
    // this.x = j * config.dx;
    // this.y = i * config.dy;
    this.assignNewRandomPoint();
  }

  assignNewRandomPoint() {
    this.point = new Point(this.x + config.dx * Math.random(), this.y + config.dy * Math.random())
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
    ctx.strokeRect(this.x, this.y, config.dx, config.dy);
  }
}
