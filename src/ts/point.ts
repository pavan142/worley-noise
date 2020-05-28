import { PointConfig, coords } from "./types";
import { ctx } from "./globals";
import { config } from "./config";
import { Dist2d } from "./utils";

export class Point {
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

  animate(value = (1 / config.animationSpeed)) {
    this.scale -= (this.velocity) ? value : -value;
    if (this.scale <= 0.8)
      this.velocity = false;
    else if (this.scale >= 1)
      this.velocity = true;

    // value = 200*value;
    // this.y -= (this.velocity) ? value : -value;
  }

  animate2(value = (1 / config.animationSpeed)) {
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
