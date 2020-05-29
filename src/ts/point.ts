import { PointConfig, coords } from "./types";
import { ctx } from "./globals";
import { config } from "./config";
import { Dist2d } from "./utils";

enum SyncType {
  MinSync,
  MaxSync,
  CenterSync
}

class BounceConfig {
  val: number;
  velocity: number;
  min: number;
  max: number;

  constructor(x, velocity, min, max) {
    this.val = x;
    this.velocity = velocity;
    this.min = min;
    this.max = max;
  }

  bounce(delta: number) {
    let newVal = this.val + this.velocity * delta;
    if (newVal <= this.min)
      this.velocity = -this.velocity
    else if (newVal >= this.max)
      this.velocity = -this.velocity

    this.val += this.velocity * delta;
  }

  synchronizeWith(other: BounceConfig, type: SyncType = SyncType.CenterSync) {
    let t1BeforeSync = (this.max - this.min)/this.velocity;
    let t2 = (other.max - other.min)/other.velocity;
    switch(type) {
      case SyncType.MinSync:
        this.max = t2*this.velocity + this.min;
        break;
      case SyncType.MaxSync:
        this.min = t2*this.velocity + this.min;
        break;
      case SyncType.CenterSync:
        let center = (this.min + this.max)/2;
        let variance = t2*this.velocity/2;
        this.min = (center - variance);
        this.max = (center + variance);
        break;
    }
    let t1AfterSync = (this.max - this.min)/this.velocity;
    console.log("sync", t2, t1BeforeSync, t1AfterSync);
  }
}

export class Point {
  x: BounceConfig;
  y: BounceConfig;
  scale: BounceConfig;

  constructor(x: number, y: number) {
    // this.scale = 0.4 + Math.random()*0.6;
    this.scale = new BounceConfig(1, 1, 0.8, 1);
    this.x = new BounceConfig(
      x,
      -1 + Math.random() * 2,
      x - config.dx / 2,
      x + config.dx / 2
    )
    this.y = new BounceConfig(
      y,
      -200,
      // -1 + Math.random() * 2,
      y - (config.dy / 4),
      y + (config.dy / 4)
    )
    // this.y.synchronizeWith(this.scale);
  }

  animate(delta = (1 / config.animationSpeed)) {
    this.scale.bounce(delta);
  }

  animate2(delta = (1 / config.animationSpeed)) {
    this.y.bounce(delta);
  }

  static fromConfig(config: PointConfig): Point {
    let point = new Point(config.x, config.y);
    point.scale.val = config.scale;
    return point;
  }

  render(radius = 2) {
    ctx.fillStyle = "#6d6875ff";
    ctx.beginPath();
    ctx.arc(this.x.val, this.y.val, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  distanceTo(point: coords) {
    return this.scale.val * (Dist2d(this.getPoint(), point));
  }

  getPoint(): coords {
    return {
      x: this.x.val,
      y: this.y.val
    }
  }

  getConfig(): PointConfig {
    return {
      x: this.x.val,
      y: this.y.val,
      scale: this.scale.val
    }
  }
}
