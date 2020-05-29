import { PointConfig, coords } from "./types";
import { ctx } from "./globals";
import { config } from "./config";
import { Dist2d } from "./utils";
import { RandomizeBounce } from "./constants";

const {dx, dy} = config;

enum SyncType {
  MinSync,
  MaxSync,
  CenterSync
}

function Rand(min, max) {
  return min + Math.random()*(max-min);
}

class BounceConfig {
  val: number;
  _velocity: number;
  direction: number;
  speed: number;
  origSpeed: number;
  min: number;
  max: number;
  count = 0;

  constructor(x, velocity, min, max) {
    this.val = x;
    this.direction = (velocity > 0) ? 1: -1;
    this._velocity = velocity;
    this.speed = Math.abs(velocity);
    this.origSpeed = Math.abs(velocity); 
    this.min = min;
    this.max = max;
  }

  get velocity(): number {
    return this.direction*this.speed;
  }

  bounce(delta: number, randomize = false) {
    this.count ++;
    let preval = this.val;
    this.val += this.velocity * delta;
    if (this.val <= this.min) {
      this.direction = -this.direction;
      this.val = this.min;
      
      let multiply = randomize ? Rand(0.5, 1) : 1
      this.speed = this.origSpeed*multiply;
      // console.log("switch after ", this.count, " cycles")
      this.count = 0;
    }
    else if (this.val >= this.max) {
      this.direction = -this.direction;
      this.val = this.max;

      let multiply = randomize ? Rand(0.5, 1) : 1
      this.speed = this.origSpeed*multiply;
      // console.log("switch after ", this.count, " cycles")
      this.count = 0;
    }

    // console.log(preval, this.val,delta);
  }

  synchronizeWith(other: BounceConfig, type: SyncType = SyncType.CenterSync) {
    let t1BeforeSync = Math.abs((this.max - this.min)/this.velocity);
    let t2 = Math.abs((other.max - other.min)/other.velocity);
    let abs_velocity = Math.abs(this.velocity)
    switch(type) {
      case SyncType.MinSync:
        this.max = t2*abs_velocity + this.min;
        break;
      case SyncType.MaxSync:
        this.min = this.max - t2*abs_velocity;
        break;
      case SyncType.CenterSync:
        let center = (this.min + this.max)/2;
        let variance = t2*abs_velocity/2;
        this.min = (center - variance);
        this.max = (center + variance);
        break;
    }
    let t1AfterSync = (this.max - this.min)/this.velocity;
    // console.log("sync", t2, t1BeforeSync, t1AfterSync);
  }
}

export class Point {
  x: BounceConfig;
  y: BounceConfig;
  scale: BounceConfig;
  velocity: boolean = false;
  scale2: number;
  constructor(x: number, y: number) {
    // this.scale = 0.4 + Math.random()*0.6;
    this.scale = new BounceConfig(1, -1, 0.8, 1);
    this.scale2 = 1;

    this.x = new BounceConfig(
      x,
      Rand(-dx/2 , dx/2),
      x - dx/2,
      x + dx/2
    )
    this.y = new BounceConfig(
      y,
      -dy/2,
      // Rand(-dy/2, dy/2),
      y - dy/4,
      y
    )
    // this.scale.synchronizeWith(this.y);
    this.y.synchronizeWith(this.scale, SyncType.MaxSync);
    // this.x.synchronizeWith(this.scale);
  }

  animate(delta = (1 / config.animationSpeed)) {
    this.scale.bounce(delta, RandomizeBounce);
  }

  animate2(delta = (1 / config.animationSpeed)) {
    this.y.bounce(delta, RandomizeBounce);
    // this.x.bounce(delta, RandomizeBounce);
  }

  static fromConfig(config: PointConfig): Point {
    let point = new Point(config.x, config.y);
    point.scale.val = config.scale;
    return point;
  }

  render(radius = 20) {
    radius = radius*this.scale.val;
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
