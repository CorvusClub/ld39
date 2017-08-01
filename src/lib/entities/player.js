import Entity from './entity';
import InputManager from '../input';
import Rope from './rope';
import Vector from '../vector';

import audio from '../audio_controller';

import {GRID_SIZE} from '../tilemap';

class Player extends Entity {
  constructor() {
    super();
    this.cord = new Rope(this.x, this.y, 250);
    this.grappleCord = new Rope(this.x, this.y, 250, 2, true);
    this.batteryLevel = 100;
    this.isPlayer = true;
    
    InputManager.on('mousedown', () => {
      if(this.destroyed) { return; }
      audio.cordSounds["retract"].currentTime = InputManager.mousedowntime / 1000 - 0.2;
      audio.retract();
      if(this.reeling) {
        this.reeling = false;
        let grappleEnd = this.grappleCord.particles[1];
        let grappleVector = new Vector(grappleEnd.x - this.x, grappleEnd.y - this.y);
        let grappleLength = grappleVector.length;
        this.grappleCord.display = false;
        this.cord.display = true;
        let grappleCordAngle = Math.atan2(grappleVector.y, grappleVector.x);
        let lengthPerSegment = grappleLength / this.cord.particles.length;
        for(let i = 0; i < this.cord.particles.length; i++) {
          let part = this.cord.particles[i];
          
          part.x = this.x + Math.cos(grappleCordAngle) * lengthPerSegment * i;
          part.y = this.y + Math.sin(grappleCordAngle) * lengthPerSegment * i;
        }
      }
      if(this.grappleCord.draining) {
        let grappleEnd = this.grappleCord.particles[1];
        let grappleVector = new Vector(grappleEnd.x - this.x, grappleEnd.y - this.y);
        let grappleLength = grappleVector.length;
        
        this.grappleCord.draining = false;
        this.grappleCord.drainAngle = null;
        this.grappleCord.display = false;
        this.cord.display = true;
        audio.impact();
        audio.chargeSounds["charging"].pause();
        let grappleCordAngle = Math.atan2(grappleVector.y, grappleVector.x);
        let lengthPerSegment = grappleLength / this.cord.particles.length;
        for(let i = 0; i < this.cord.particles.length; i++) {
          let part = this.cord.particles[i];
          
          part.x = this.x + Math.cos(grappleCordAngle) * lengthPerSegment * i;
          part.y = this.y + Math.sin(grappleCordAngle) * lengthPerSegment * i;
        }
      }
    });
    InputManager.on('mouseup', () => {
      if(this.destroyed) { return; }
      audio.cordSounds["retract"].pause();
      if(InputManager.mousedowntime >= 500) {
        InputManager.mousedowntime = 0;
        audio.fire();
        let mousePos = InputManager.getMousePos();
        let grappleEnd = this.grappleCord.particles[1];
        grappleEnd.x = this.x;
        grappleEnd.y = this.y;
        
        let diff = new Vector(mousePos.x - this.x, mousePos.y - this.y);
        
        grappleEnd.acceleration.set(diff.unit().scale(10));
        
        this.shooting = true;
        this.grappleCord.display = true;
        this.cord.display = false;
      }
    })
  }
  draw(context) {
    this.cord.draw(context);
    this.grappleCord.draw(context);
    let mousePos = InputManager.getMousePos();
    
    
    let batteryPercentage = this.batteryLevel / 100;
    if(batteryPercentage < 0) {
      batteryPercentage = 0;
    }
    let leftAngle = Math.PI / 2 - batteryPercentage * Math.PI;
    let rightAngle = Math.PI / 2 + batteryPercentage * Math.PI;
    
    let gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2 * batteryPercentage);
    gradient.addColorStop(0, '#36a78b');
    gradient.addColorStop(1, 'rgba(49, 152, 126, 0)');
    context.fillStyle = gradient;
    
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    context.fill();
    
    context.fillStyle = "black";
    
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    
    context.fillStyle = "#36a78b";
    
    let batteryIndicatorRadius = this.radius * 0.75;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.moveTo(this.x + Math.cos(leftAngle) * batteryIndicatorRadius, this.y + Math.sin(leftAngle) * batteryIndicatorRadius);
    context.lineTo(this.x + Math.cos(rightAngle) * batteryIndicatorRadius, this.y + Math.sin(rightAngle) * batteryIndicatorRadius);
    context.arc(this.x, this.y, batteryIndicatorRadius, leftAngle, rightAngle, false);
    context.fill();
  }
  update(dt, level) {
    if(this.destroyed) { return; }
    this.batteryLevel -= dt / 1000;
    if(this.batteryLevel <= 0) {
      this.batteryLevel = 0;
      window.gameOver();
      return;
    }
    if(this.batteryLevel > 100) {
      this.batteryLevel = 100;
    }
    if(this.shooting) {
      let grappleEnd = this.grappleCord.particles[1];
      let grappleVector = new Vector(grappleEnd.x - this.x, grappleEnd.y - this.y);
      let grappleLength = grappleVector.length;
      
      if(grappleLength >= this.cord.length) {
        grappleEnd.acceleration.set({x: 0, y: 0});
      }
      
      if(grappleEnd.acceleration.length < 0.1) {
        if(grappleEnd.colliding) {
          this.reeling = true;
          audio.impact();
        }
        else if(grappleEnd.collidingEnt && grappleEnd.collidingEnt.isEnemy && grappleEnd.collidingEnt.batteryLevel > 0) {
          this.grappleCord.draining = true;
          this.grappleCord.drainTarget = grappleEnd.collidingEnt;
          this.grappleCord.drainTarget.startDrain();
          audio.charge();
        }
        else {
          this.grappleCord.display = false;
          this.cord.display = true;
          let grappleCordAngle = Math.atan2(grappleVector.y, grappleVector.x);
          let lengthPerSegment = grappleLength / this.cord.particles.length;
          for(let i = 0; i < this.cord.particles.length; i++) {
            let part = this.cord.particles[i];
            
            part.x = this.x + Math.cos(grappleCordAngle) * lengthPerSegment * i;
            part.y = this.y + Math.sin(grappleCordAngle) * lengthPerSegment * i;
          }
        }
        this.shooting = false;
      }
    }
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    if(InputManager.left) {
      this.acceleration.x = -1;
    }
    if(InputManager.right) {
      this.acceleration.x = 1;
    }
    if(InputManager.up) {
      this.acceleration.y = -1;
    }
    if(InputManager.down) {
      this.acceleration.y = 1;
    }
    
    if(this.reeling) {
      let grappleEnd = this.grappleCord.particles[1];
      let grappleVector = new Vector(grappleEnd.x - this.x, grappleEnd.y - this.y);
      let grappleLength = grappleVector.length;
      
      this.acceleration.add(grappleVector.unit().scale(3));
      
      if(this.colliding || grappleLength < 0.1) {
        this.acceleration.set({x: 0, y: 0});
        
        this.reeling = false;
        this.grappleCord.display = false;
        this.cord.display = true;
        let grappleCordAngle = Math.atan2(grappleVector.y, grappleVector.x);
        let lengthPerSegment = grappleLength / this.cord.particles.length;
        for(let i = 0; i < this.cord.particles.length; i++) {
          let part = this.cord.particles[i];
          
          part.x = this.x + Math.cos(grappleCordAngle) * lengthPerSegment * i;
          part.y = this.y + Math.sin(grappleCordAngle) * lengthPerSegment * i;
        }
      }
    }
    
    if(this.grappleCord.draining) {
      if(this.grappleCord.drainTarget.batteryLevel > 0) {
        this.grappleCord.drainTarget.batteryLevel -= dt / 100;
        this.batteryLevel += dt / 100;
      }
      
      let grappleEnd = this.grappleCord.particles[1];
      let grappleVector = new Vector(grappleEnd.x - this.x, grappleEnd.y - this.y);
      let grappleLength = grappleVector.length;
      
      grappleEnd.x = this.grappleCord.drainTarget.x;
      grappleEnd.y = this.grappleCord.drainTarget.y;
      
      if(grappleLength > this.cord.length || this.grappleCord.drainTarget.batteryLevel <= 0) {
        this.grappleCord.draining = false;
        this.grappleCord.drainAngle = null;
        this.grappleCord.display = false;
        this.cord.display = true;
        audio.impact();
        audio.chargeSounds["charging"].pause();
        if(this.grappleCord.drainTarget) {
          this.grappleCord.drainTarget.stopDrain();
        }
        let grappleCordAngle = Math.atan2(grappleVector.y, grappleVector.x);
        let lengthPerSegment = grappleLength / this.cord.particles.length;
        for(let i = 0; i < this.cord.particles.length; i++) {
          let part = this.cord.particles[i];
          
          part.x = this.x + Math.cos(grappleCordAngle) * lengthPerSegment * i;
          part.y = this.y + Math.sin(grappleCordAngle) * lengthPerSegment * i;
        }
      }
    }
    
    super.update(dt, level);
    
    this.cord.anchor.x = this.x;
    this.cord.anchor.y = this.y;
    this.cord.update(dt, level);
    this.grappleCord.anchor.x = this.x;
    this.grappleCord.anchor.y = this.y;
    this.grappleCord.update(dt, level);
    
    let myTilePos = {x: Math.floor(this.x / GRID_SIZE), y: Math.floor(this.y / GRID_SIZE)};
    let myTile = level.map.get(myTilePos.x, myTilePos.y);
    if(myTile === 'E') {
      this.destroyed = true;
      window.renderer.fade = true;
      window.renderer.fadeTimer = 1500;
      setTimeout(() => {
        window.renderer.fade = false;
        window.renderer.fadeIn = 1500;
        window.nextLevel();
      }, 1500);
    }
  }
}



export default Player;