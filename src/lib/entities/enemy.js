import Entity from './entity';
import Vector from '../vector';

import audio from '../audio_controller';

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y);
    
    this.batteryLevel = 60;
    
    this.radius = 15;
    
    this.mood = '?';
    
    this.isEnemy = true;
    
    this.timeSinceRandomWalk = 0;
    this.randomWalkDuration = 0;
    this.cooldown = 0;
  }
  draw(context) {
    let batteryPercentage = this.batteryLevel / 60;
    let leftAngle = Math.PI / 2 - batteryPercentage * Math.PI;
    let rightAngle = Math.PI / 2 + batteryPercentage * Math.PI;
    
    let gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3 * batteryPercentage);
    gradient.addColorStop(0, '#36a78b');
    gradient.addColorStop(1, 'rgba(49, 152, 126, 0)');
    context.fillStyle = gradient;
    
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    context.fill();
    
    context.fillStyle = "#797979";
    
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    
    context.fillStyle = "#36a78b";
    
    let batteryIndicatorRadius = this.radius * 0.70;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.moveTo(this.x + Math.cos(leftAngle) * batteryIndicatorRadius, this.y + Math.sin(leftAngle) * batteryIndicatorRadius);
    context.lineTo(this.x + Math.cos(rightAngle) * batteryIndicatorRadius, this.y + Math.sin(rightAngle) * batteryIndicatorRadius);
    context.arc(this.x, this.y, batteryIndicatorRadius, leftAngle, rightAngle, false);
    context.fill();
    
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${this.radius * 0.6}px sans-serif`;
    context.fillText(this.mood, this.x, this.y);
  }
  startDrain() {
    this.cooldown = 400;
    this.acceleration.set({x:0, y: 0});
    this.mood = 'o_o';
  }
  stopDrain() {
    this.cooldown = 400;
  }
  update(dt, level) {
    super.update(dt, level);
    this.batteryLevel -= dt / 1000;
    if(this.batteryLevel <= 0) {
      // die
      this.batteryLevel = 0;
      this.mood = 'x_x';
      return;
    }
    
    if(this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }
    if(this.colliding) {
      this.randomWalkDuration = 0;
    }
    this.timeSinceRandomWalk += dt;
    let playerVector = new Vector(level.player.x - this.x, level.player.y - this.y);
    
    if(this.collidingEnt && this.collidingEnt.isPlayer) {
      this.collidingEnt.velocity.add(playerVector.unit().scale(250));
      this.velocity.add(playerVector.unit().scale(-250));
      
      let stealAmount = 60 - this.batteryLevel;
      if(stealAmount > 25) {
        stealAmount = 25;
      }
      level.player.batteryLevel -= stealAmount;
      this.batteryLevel += stealAmount;
      audio.zap();
      this.cooldown = 600;
    }
    if(level.player.grappleCord.draining && level.player.grappleCord.drainTarget === this || level.player.destroyed) {
      this.acceleration.set(playerVector.unit().scale(-1));
      this.mood = 'o_o';
    }
    else if(playerVector.length < 350 && this.batteryLevel < 55 && !level.player.destroyed) {
      this.mood = 'ಠ▃ಠ';
      this.acceleration.set(playerVector.unit().scale(2));
    }
    else {
      this.mood = '^_^';
      if(this.timeSinceRandomWalk >= this.randomWalkDuration) {
        this.randomWalkDirection = new Vector(-1 + Math.random() * 2, -1 + Math.random() * 2).unit();
        this.timeSinceRandomWalk = 0;
        this.randomWalkDuration = 500 + Math.random() * 2000;
      }
      this.acceleration.set(this.randomWalkDirection);
    }
  }
}

export default Enemy;