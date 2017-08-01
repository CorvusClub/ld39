import {LEVEL_WIDTH, LEVEL_HEIGHT, GRID_SIZE} from './tilemap';

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.scale = 1.25;
  }
  
  get width() {
    return window.innerWidth / this.scale;
  }
  get height() {
    return window.innerHeight / this.scale;
  }
  
  focusEnt(entity) {
    this.lookAt(entity.x, entity.y);
  }
  
  lookAt(x, y) {
    this.x = x;
    this.y = y;
    if(this.x - this.width / 2 < 0) {
      this.x = this.width / 2;
    }
    if(this.y - this.height / 2 < 0) {
      this.y = this.height / 2;
    }
    if(this.x + this.width / 2 > LEVEL_WIDTH * GRID_SIZE) {
      this.x = LEVEL_WIDTH * GRID_SIZE - this.width / 2;
    }
    if(this.y + this.height / 2 > LEVEL_HEIGHT * GRID_SIZE) {
      this.y = LEVEL_HEIGHT * GRID_SIZE - this.height / 2;
    }
  }
  

  translateMousePosition(x, y) {
    let translated = {x:x, y:y};
    
    translated.x = (x / this.scale) - ((window.innerWidth * 0.5) / this.scale);
    translated.y = (y / this.scale) - ((window.innerHeight * 0.5) / this.scale);
    
    translated.x += this.x;
    translated.y += this.y;
    
    return translated
  }
}

export default Camera;