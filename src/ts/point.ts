import { PointConfig, coords } from "./types";
import { ctx } from "./globals";
import { config } from "./config";
import { Dist2d } from "./utils";

enum SyncType {
  MinSync,
  MaxSync,
  CenterSync
}

function Rand(min, max?: number) {
  if (max)
    return min + Math.random() * (max - min);
  else {
    let x = Math.abs(min);
    min = -x;
    max = +x;
    return min + Math.random() * (max - min);
  }
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
    this.direction = (velocity > 0) ? 1 : -1;
    this._velocity = velocity;
    this.speed = Math.abs(velocity);
    this.origSpeed = Math.abs(velocity);
    this.min = min;
    this.max = max;
  }

  get velocity(): number {
    return this.direction * this.speed;
  }

  bounce(delta: number, randomize = false) {
    this.count++;
    let preval = this.val;
    this.val += this.velocity * delta;
    if (this.val <= this.min) {
      this.direction = -this.direction;
      this.val = this.min;

      let multiply = randomize ? Rand(0.5, 1) : 1
      this.speed = this.origSpeed * multiply;
      // console.log("switch after ", this.count, " cycles")
      this.count = 0;
    }
    else if (this.val >= this.max) {
      this.direction = -this.direction;
      this.val = this.max;

      let multiply = randomize ? Rand(0.5, 1) : 1
      this.speed = this.origSpeed * multiply;
      // console.log("switch after ", this.count, " cycles")
      this.count = 0;
    }

    // console.log(preval, this.val,delta);
  }

  synchronizeWith(other: BounceConfig, type: SyncType = SyncType.CenterSync) {
    let t1BeforeSync = Math.abs((this.max - this.min) / this.velocity);
    let t2 = Math.abs((other.max - other.min) / other.velocity);
    let abs_velocity = Math.abs(this.velocity)
    switch (type) {
      case SyncType.MinSync:
        this.max = t2 * abs_velocity + this.min;
        break;
      case SyncType.MaxSync:
        this.min = this.max - t2 * abs_velocity;
        break;
      case SyncType.CenterSync:
        let center = (this.min + this.max) / 2;
        let variance = t2 * abs_velocity / 2;
        this.min = (center - variance);
        this.max = (center + variance);
        break;
    }
    let t1AfterSync = (this.max - this.min) / this.velocity;
    // console.log("sync", t2, t1BeforeSync, t1AfterSync);
  }
}

export class Point {
  x: BounceConfig;
  y: BounceConfig;
  scale: BounceConfig;

  constructor(x: number, y: number) {
    // this.scale = 0.4 + Math.random()*0.6;
    const { RandomizeBounce,
      SynchronizeBounces,
      BounceX,
      GlobalMovement,
      RandomizeMovment,
      RandomizeScale } = config;

    const { dx, dy, w, h, max_d } = config;

    let vs, s_min, s_max;
    if (RandomizeScale) {
      vs = Rand(0.5, 1);
      s_min = 0.5; s_max = 1
    } else {
      vs = -1;
      s_min = 0.8; s_max = 1;
    }

    this.scale = new BounceConfig(1, vs, s_min, s_max);
    let x_min, x_max, y_min, y_max, vx, vy;
    if (GlobalMovement) {
      x_min = y_min = 0;
      x_max = w; y_max = h;
      if (RandomizeMovment) {
        let speed = Rand(0.6, 1) * max_d
        let angle = Rand(0, 2 * Math.PI)
        vx = speed * Math.cos(angle);
        vy = speed * Math.sin(angle);
      } else {
        vx = vy = max_d;
      }
    } else {
      x_min = x - dx / 4; y_min = y - dy / 4;
      x_max = x + dx / 4; y_max = y;
      if (RandomizeMovment) {
        vx = Rand(dx / 2);
        vy = Rand(dy / 2);
      } else {
        vx = -dx / 2;
        vy = -dy / 2
      }
    }

    this.x = new BounceConfig(x, vx, x_min, x_max);
    this.y = new BounceConfig(y, vy, y_min, y_max);
    if (SynchronizeBounces) {
      this.y.synchronizeWith(this.scale, SyncType.MaxSync);
      this.x.synchronizeWith(this.scale);
    }
  }

  animate(delta = (1 / config.animationSpeed)) {
    this.scale.bounce(delta, config.RandomizeBounce);
  }

  animate2(delta = (1 / config.animationSpeed)) {
    this.y.bounce(delta, config.RandomizeBounce);
    if (config.BounceX)
      this.x.bounce(delta, config.RandomizeBounce);
    // console.log(this.x.val,this.x.min, this.x.max)
  }

  static fromConfig(config: PointConfig): Point {
    let point = new Point(config.x, config.y);
    point.scale.val = config.scale;
    return point;
  }

  render(radius = 5) {
    radius = radius * this.scale.val;
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
