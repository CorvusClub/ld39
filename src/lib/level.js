import TileMap from './tilemap';
import {GRID_SIZE} from './tilemap';
import LevelGen from './level_gen';
import Player from './entities/player';
import Enemy from './entities/enemy';

class Level {
  constructor() {
    this.map = new TileMap();
    this.player = new Player(0, 0);
    this.ents = [this.player];
    this.timeAlive = 0;
  }
  generate() {
    let generator = new LevelGen(this, 5);
    generator.generate();
  }
  static generate() {
    let level = new Level();
    level.generate();
    return level;
  }
  
  update(dt) {
    if(!this.player.destroyed) {
      this.timeAlive += dt;
    }
    this.ents.forEach((ent) => {
      ent.update(dt, this);
    });
  }
  
  addEnemy(x, y) {
    this.ents.push(new Enemy(x, y));
  }
  
  checkTileCollision(ent) {
    let tile = {x: Math.floor(ent.x / GRID_SIZE), y: Math.floor(ent.y / GRID_SIZE)};
    let topleft = {x: tile.x - 1, y: tile.y - 1};
    let left = {x: tile.x - 1, y: tile.y};
    let bottomleft = {x: tile.x - 1, y: tile.y + 1};
    let bottom = {x: tile.x, y: tile.y + 1};
    let bottomright = {x: tile.x + 1, y: tile.y + 1};
    let right = {x: tile.x + 1, y: tile.y};
    let topright = {x: tile.x + 1, y: tile.y - 1};
    let top = {x: tile.x, y: tile.y - 1};
    
    let neighbors = [tile, topleft, left, bottomleft, bottom, bottomright, right, topright, top];
    for(let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if(this.map.isWall(neighbor.x, neighbor.y)) {
        let rectTopLeft = {x: neighbor.x * GRID_SIZE, y: neighbor.y * GRID_SIZE};
        let collisionCheckPoint = {x: ent.x, y: ent.y};
        if(collisionCheckPoint.x > rectTopLeft.x + GRID_SIZE) {
          collisionCheckPoint.x = rectTopLeft.x + GRID_SIZE;
        }
        if(collisionCheckPoint.x < rectTopLeft.x) {
          collisionCheckPoint.x = rectTopLeft.x;
        }
        if(collisionCheckPoint.y > rectTopLeft.y + GRID_SIZE) {
          collisionCheckPoint.y = rectTopLeft.y + GRID_SIZE;
        }
        if(collisionCheckPoint.y < rectTopLeft.y) {
          collisionCheckPoint.y = rectTopLeft.y;
        }
        let distance = ent.contains(collisionCheckPoint);
        if(distance === false) {
          continue;
        }
        
        let tile = this.map.get(neighbor.x, neighbor.y);
        if(!tile) {
          tile = "bounds";
        }
        return {pos: {x: neighbor.x, y: neighbor.y}, checkPoint: collisionCheckPoint, tile: tile, distance: distance};
      }
    };
    return false;
  }
}

export default Level;