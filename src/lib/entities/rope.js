import Entity from './entity';
import Vector from '../vector';

import input from '../input'

const PLUG_SIZE = 5;

class RopeParticle extends Entity {
  constructor(x, y, length, target, index, total) {
    super(x, y);
    this.length = length;
    this.target = target;
    this.radius = 1;
    this.index = index;
    this.total = total;
  }
  update(dt, level) {
    if(!this.target) {
      if(this.x) {
        super.update(dt, level);
        if(this.colliding || (this.collidingEnt && this.collidingEnt.isEnemy)) {
          this.acceleration.set({x: 0, y: 0});
          this.velocity.set({x: 0, y: 0});
        }
      }
      return;
    }
    if(!this.x) {
      this.x = this.target.x + Math.random() * 5;
    }
    if(!this.y) {
      this.y = this.target.y + Math.random() * 5;
    }
    let diffVector = new Vector(this.x - this.target.x, this.y - this.target.y); // B - A
    
    let length = this.length;
    if(input.mousedowntime > 0) {
      let segmentDuration = 500 / this.total;
      let myTurn = segmentDuration * this.index;
      if(input.mousedowntime > myTurn) {
        let myTurnBase = input.mousedowntime - myTurn;
        length = this.length - (myTurnBase / segmentDuration) * this.length;
        if(length < 0) {
          length = 0;
        }
      }
    }
    let lengthVector = diffVector.unit().scale(length);
    lengthVector.add(this.target);
    
    this.x = lengthVector.x;
    this.y = lengthVector.y;
    
    super.update(dt, level);
  }
}

class Rope {
  constructor(x, y, length, segmentCount=15, noAttachment=false) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.segmentCount = segmentCount;
    this.particles = [];
    this.display = true;
    
    let previousParticle = null;
    for(var i = 0; i < this.segmentCount; i++) {
      let newParticle;
      if(noAttachment) {
        newParticle = new RopeParticle(this.x, this.y, this.length / (this.segmentCount - 1), null, i, this.segmentCount);
      }
      else {
        newParticle = new RopeParticle(this.x, this.y, this.length / (this.segmentCount - 1), previousParticle, i, this.segmentCount);
      }
      this.particles.push(newParticle);
      previousParticle = newParticle;
    }
    
    this.particles[this.particles.length - 1].radius = PLUG_SIZE;
    
    this.anchor = this.particles[0];
    
  }
  update(dt, level) {
    this.particles.forEach(part => part.update(dt, level));
  }
  draw(context) {
    if(!this.display) {
      return;
    }
    
    context.strokeStyle = "#50505a";
    
    if(this.draining) {
      context.strokeStyle = "#36a78b";
    }
    context.beginPath();
    context.moveTo(this.anchor.x, this.anchor.y);
    for(let i = 1; i < this.particles.length; i++) {
      let p = this.particles[i];
      context.lineTo(p.x, p.y);
    }
    context.stroke();
    
    context.fillStyle = "#50505a";
    let last = this.particles[this.particles.length - 1];
    
    let second_last = this.particles[this.particles.length - 2];
    let dx = last.x - second_last.x;
    let dy = last.y - second_last.y;
    
    let angle = Math.atan2(dy, dx);
    
    if(this.draining) {
      if(this.drainAngle) {
        angle = this.drainAngle;
      }
      else {
        this.drainAngle = angle;
      }
    }
    
    let cosAngle = Math.cos(angle);
    let sinAngle = Math.sin(angle);
    
    context.beginPath();
    context.arc(last.x, last.y, PLUG_SIZE, angle + Math.PI / 2, angle + Math.PI * 1.5);
    context.fill();
    context.beginPath();
    let prongAngle = angle - Math.PI / 2;
    let prongX = last.x + Math.cos(prongAngle) * PLUG_SIZE / 3;
    let prongY = last.y + Math.sin(prongAngle) * PLUG_SIZE / 3;
    context.moveTo(prongX, prongY);
    context.lineTo(prongX + PLUG_SIZE * cosAngle, prongY + PLUG_SIZE * sinAngle);
    prongX = last.x - Math.cos(prongAngle) * PLUG_SIZE / 3;
    prongY = last.y - Math.sin(prongAngle) * PLUG_SIZE / 3;
    context.moveTo(prongX, prongY);
    context.lineTo(prongX + PLUG_SIZE * cosAngle, prongY + PLUG_SIZE * sinAngle);
    context.stroke();
  }
}

export default Rope;