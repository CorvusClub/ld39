const LINOLEUM_COLOR = "#cccccc";
const LINOLEUM_BORDER_COLOR = "#b3b3b3";
const LINOLEUM_BORDER_SIZE = 2;

const WALL_COLOR = "#8c7c7c";

import {GRID_SIZE} from './tilemap';

import Camera from "./camera";

import input from './input';

const FLOOR_IMAGE = document.createElement("img");
FLOOR_IMAGE.src = "./static/images/floor.png";

const WALL_IMAGE = document.createElement("img");
WALL_IMAGE.src = "./static/images/wall.png";

const STAIR_IMAGE = document.createElement("img");
STAIR_IMAGE.src = "./static/images/stairs.png";

const STAIR_UP_IMAGE = document.createElement("img");
STAIR_UP_IMAGE.src = "./static/images/stairs_up.png";

const POWER_GAUGE_X = 20;
const POWER_GAUGE_Y = 40;
const POWER_GAUGE_WIDTH = 55;
const POWER_GAUGE_HEIGHT = 300;

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;
    this.camera = new Camera();
  }
  update(dt) {
    this.context.save();
    this.context.translate(this.canvas.width / 2 - this.camera.x * this.camera.scale,
                           this.canvas.height / 2 - this.camera.y * this.camera.scale);
    this.context.scale(this.camera.scale, this.camera.scale);
    
    this.context.clearRect(this.camera.x - this.camera.width / 2, this.camera.y - this.camera.height / 2, this.camera.width, this.camera.height);
    
    
    
    this.context.fillStyle = "blue";
    let grid = this.level.map.tiles;
    for(let x = 0; x < grid.length; x++) {
      for(let y = 0; y < grid[x].length; y++) {
        let tile = grid[x][y];
        if(tile === ' ') {
          this.context.drawImage(FLOOR_IMAGE, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE + 0.7, GRID_SIZE + 0.7);
        }
        
        if(tile === 'x') {
          this.context.drawImage(WALL_IMAGE, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE + 0.7, GRID_SIZE + 0.7);
        }
        
        if(tile === 'E') {
          this.context.drawImage(STAIR_IMAGE, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE + 0.7, GRID_SIZE + 0.7);
        }
        
        if(tile === 'F') {
          this.context.drawImage(STAIR_UP_IMAGE, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE + 0.7, GRID_SIZE + 0.7);
        }
        
        if(tile !== 'x') {
          this.context.fillStyle = LINOLEUM_BORDER_COLOR;
          let walls = this.level.map.getNearbyWalls(x, y);
          if(walls.left) {
            this.context.fillRect(x * GRID_SIZE, y * GRID_SIZE, LINOLEUM_BORDER_SIZE, GRID_SIZE);
          }
          if(walls.right) {
            this.context.fillRect(x * GRID_SIZE + GRID_SIZE - LINOLEUM_BORDER_SIZE, y * GRID_SIZE, LINOLEUM_BORDER_SIZE, GRID_SIZE);
          }
          
          if(walls.up) {
            this.context.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, LINOLEUM_BORDER_SIZE);
          }
          if(walls.down) {
            this.context.fillRect(x * GRID_SIZE, y * GRID_SIZE + GRID_SIZE - LINOLEUM_BORDER_SIZE, GRID_SIZE, LINOLEUM_BORDER_SIZE);
          }
        }
      }
    }
    
    let powerTotal = 0;
    let powerAmount = 0;
    this.level.ents.forEach(ent => {
      ent.draw(this.context);
      if(ent.isEnemy) {
        powerTotal += 60;
        powerAmount += ent.batteryLevel;
      }
    });
    
    let powerPercentage = powerAmount / powerTotal;
    
    let alpha = (1 - powerPercentage) * 0.5;
    
    this.context.globalAlpha = alpha;
    this.context.fillStyle = "black";
    this.context.fillRect(this.camera.x - this.camera.width / 2, this.camera.y - this.camera.height / 2, this.camera.width, this.camera.height);
    this.context.globalAlpha = 1;
    
    
    this.context.restore();
    
    
    if(this.fade && this.fadeTimer >= 0) {
      this.context.globalAlpha = (1500 - this.fadeTimer) / 1500;
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      this.fadeTimer -= dt;
      if(this.fadeTimer < 0) {
        this.fadeTimer = 0;
      }
    }
    if(this.fadeIn > 0) {
      this.fadeIn -= dt;
      this.context.globalAlpha = this.fadeIn / 1500;
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    this.context.globalAlpha = 1;
    if(this.level.player.batteryLevel <= 0) {
      this.context.fillStyle = "#36a78b";
      this.context.font = "50px monospace";
      this.context.textAlign = "center";
      let underscore = '_';
      if(!this.underscoreTime || this.underscoreTime < 0) {
        this.underscoreTime = 1000;
      }
      this.underscoreTime -= dt;
      if(this.underscoreTime < 500) {
        underscore = ' ';
      }
      this.context.fillText("OUT OF POWER.", window.innerWidth / 2, window.innerHeight / 2);
      this.context.fillText(`REBOOT?${underscore}`, window.innerWidth / 2, window.innerHeight / 2 + 70);
      
      let seconds = Math.floor(this.level.timeAlive / 1000);
      let minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      
      let formattedTime = `${pad(minutes)}:${pad(seconds)}`;
      
      this.context.fillStyle = "#36a78b";
      this.context.fillText(`GOT TO FLOOR ${this.level.count} AND SURVIVED ${formattedTime}`, window.innerWidth / 2, window.innerHeight / 2 + 190);
      return;
    }
    
    this.context.textAlign = "left";
    
    this.context.globalAlpha = 0.4;
    this.context.fillStyle = "white";
    this.context.fillRect(POWER_GAUGE_X, POWER_GAUGE_Y, POWER_GAUGE_WIDTH, POWER_GAUGE_HEIGHT);
    this.context.globalAlpha = 1;
    
    this.context.fillStyle = "#36a78b";
    let fillHeight = POWER_GAUGE_HEIGHT * powerPercentage;
    this.context.fillRect(POWER_GAUGE_X + 5, POWER_GAUGE_Y - 5 + POWER_GAUGE_HEIGHT - fillHeight, POWER_GAUGE_WIDTH - 10, fillHeight - 5);
    
    this.context.font = "10px sans-serif";
    this.context.fillText("PWR LEFT", POWER_GAUGE_X + 1, POWER_GAUGE_Y - 15);
    this.context.fillText("ON FLOOR", POWER_GAUGE_X + 1, POWER_GAUGE_Y - 5);
    
    function pad(str) {
      str = str.toString();
      if(str.length === 1) {
        return '0' + str;
      }
      return str;
    }
    
    let seconds = Math.floor(this.level.timeAlive / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    
    let formattedTime = `${pad(minutes)}:${pad(seconds)}`;
    
    this.context.fillStyle = "black";
    this.context.fillRect(10, window.innerHeight - 35, 200, 32);
    this.context.fillStyle = "#36a78b";
    this.context.font = "20px sans-serif";
    this.context.fillText(`FLOOR ${this.level.count}         ${formattedTime}`, 15, window.innerHeight - 10);
    
    
    
  }
}

export default Renderer;