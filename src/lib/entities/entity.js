import Vector from '../vector';
import {GRID_SIZE} from '../tilemap';

const SPEED_MOD = 0.002;

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    
    this.acceleration = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.frictionCoeffecient = 0.15;
  }
  update(dt, level) {
    let negativeVelocity = this.velocity.unit().scale(-this.velocity.length * this.frictionCoeffecient);
    this.velocity.x += negativeVelocity.x * dt/25;
    this.velocity.y += negativeVelocity.y * dt/25;
    
    let negativeAcceleration = this.acceleration.unit().scale(-this.acceleration.length * this.frictionCoeffecient);
    this.acceleration.x += negativeAcceleration.x * dt/25;
    this.acceleration.y += negativeAcceleration.y * dt/25;
    
    if(this.velocity.length < 0.01) {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    
    this.x += this.velocity.x * SPEED_MOD * dt;
    this.y += this.velocity.y * SPEED_MOD * dt;
    
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    
    this.colliding = false;
    
    for(let i = 0; i < 4; i++) {
      let collidingTile = level.checkTileCollision(this);
      if(collidingTile) {
        this.colliding = true;
        this.collidingTile = collidingTile;
        let rectTopLeft = {x: collidingTile.pos.x * GRID_SIZE, y: collidingTile.pos.y * GRID_SIZE};
        let check = {x: this.x, y: this.y};
        if(check.x > rectTopLeft.x + GRID_SIZE) {
          check.x = rectTopLeft.x + GRID_SIZE;
        }
        if(check.x < rectTopLeft.x) {
          check.x = rectTopLeft.x;
        }
        if(check.y > rectTopLeft.y + GRID_SIZE) {
          check.y = rectTopLeft.y + GRID_SIZE;
        }
        if(check.y < rectTopLeft.y) {
          check.y = rectTopLeft.y;
        }
        if(check.x < this.x) {
          this.x = check.x + this.radius + 1;
          this.velocity.x *= -0.3;
        }
        else if(check.x > this.x) {
          this.x = check.x - this.radius - 1;
          this.velocity.x *= -0.3;
        }
        else if(check.y < this.y) {
          this.y = check.y + this.radius + 1;
          this.velocity.y *= -0.3;
        }
        else if(check.y > this.y) {
          this.y = check.y - this.radius - 1;
          this.velocity.y *= -0.3;
        }
      }
    }
    this.collidingEnt = null;
    level.ents.forEach(ent => {
      if(ent === this) {
        return;
      }
      let diffVector = new Vector(this.x - ent.x, this.y - ent.y);
      if(diffVector.length < this.radius + ent.radius) {
        this.collidingEnt = ent;
        let resolutionVector = diffVector.unit().scale(1.5);
        this.x += resolutionVector.x;
        this.y += resolutionVector.y;
      }
    });
  }
  contains(point) {
    let dx = point.x - this.x;
    let dy = point.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if(distance <= this.radius) {
      return distance;
    }
    return false;
  }
}

export default Entity;