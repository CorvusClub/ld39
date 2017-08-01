import roomTypes from '../rooms';
import exitRoom from '../rooms/exit';
import spawnRoom from '../rooms/spawn';

import {LEVEL_WIDTH, LEVEL_HEIGHT, GRID_SIZE} from './tilemap';
import TileMap from './tilemap';

const MAZE_WINDING_CHANCE = 0.2;

class Direction {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  apply(other) {
    return {x: this.x + other.x, y: this.y + other.y};
  }
  scale(scalar) {
    return new Direction(this.x * scalar, this.y * scalar);
  }
  distance(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

Direction.Up = new Direction(0, -1);
Direction.Down = new Direction(0, 1);
Direction.Left = new Direction(-1, 0);
Direction.Right = new Direction(1, 0);


class LevelGen {
  constructor(level, roomCount) {
    this.rooms = [];
    this.level = level;
    this.hasExit = false;
    this.hasSpawn = false;
  }
  getRandomRoomType() {
    return roomTypes[Math.floor(Math.random() * roomTypes.length)];
  }
  findSpawn(room) {
    let empty = false;
    while(!empty) {
      for(let x = 0; x < room.type.tiles.length; x++) {
        for(let y = 0; y < room.type.tiles[0].length; y++) {
          if(room.type.tiles[x][y] === 'F') {
            return {x: room.x + x, y: room.y + y};
          }
        }
      }
    }
  }
  randomRoom() {
    let type;
    
    if(!this.hasSpawn) {
      type = TileMap.parseString(spawnRoom);
      this.spawnRoom = type;
    }
    else if(!this.hasExit) {
      type = TileMap.parseString(exitRoom);
      this.exitRoom = type;
    }
    else {
      type = this.getRandomRoomType();
    }
    
    let x = Math.floor(Math.random() * (LEVEL_WIDTH - type.width));
    let y = Math.floor(Math.random() * (LEVEL_HEIGHT - type.height));
    
    return {x, y, type};
  }
  generate() {
    this.regionCount = 0;
    this.regions = new Array(LEVEL_WIDTH);
    for(let i = 0; i < this.regions.length; i++) {
      this.regions[i] = new Array(LEVEL_HEIGHT);
    }
    
    this.sprinkleRooms();
    this.fillWithMaze();
    this.connectRegions();
    
    this.removeDeadEnds();
    
    this.rooms.forEach(room => {
      this.level.map.insertRoom(room.x, room.y, room.type);
      room.type.enemySpawns.forEach(pos => this.level.addEnemy((room.x + pos.x) * GRID_SIZE, (room.y + pos.y) * GRID_SIZE));
    });
    
    this.removeDeadEnds();
  }
  sprinkleRooms() {
    let firstRoom = this.randomRoom();
    this.rooms.push(firstRoom);
    this.regionCount++;
    this.carveRoom(firstRoom);
    
    let emptySpot = this.findSpawn(firstRoom);
    this.level.player.x = emptySpot.x * GRID_SIZE + GRID_SIZE / 2;
    this.level.player.y = emptySpot.y * GRID_SIZE + GRID_SIZE / 2;
    
    let attempts = 0;
    while(attempts < 400) {
      attempts++;
        
      let room = this.randomRoom();
      if(this.validRoom(room)) {
        if(room.type === this.spawnRoom) {
          this.hasSpawn = true;
        }
        if(room.type === this.exitRoom) {
          this.hasExit = true;
        }
        this.rooms.push(room);
        this.regionCount++;
        this.carveRoom(room);
      }
    }
  }
  validRoom(room) {
    if(room.x < 0 || room.y < 0 || room.x + room.type.width >= LEVEL_WIDTH || room.y + room.type.height >= LEVEL_HEIGHT) {
      return false;
    }
    let collisionWithOtherRoom = this.rooms.find(otherRoom => {
      return !(
        room.x + room.type.width + 2 < otherRoom.x ||
        room.y + room.type.height + 2 < otherRoom.y ||
        room.x > otherRoom.x + otherRoom.type.width + 2 || 
        room.y > otherRoom.y + otherRoom.type.height + 2
      );
    });
    if(collisionWithOtherRoom) {
      return false;
    }
    return true;
  }
  carveRoom(room) {
    for(let x = 0; x < room.type.width; x++) {
      for(let y = 0; y < room.type.height; y++) {
        this.carve({x: room.x + x, y: room.y + y});
      }
    }
  }
  pointInRoom(pos) {
    let roomMatch = this.rooms.find(room => {
      return !(
        pos.x < room.x ||
        pos.y < room.y ||
        room.x + room.type.width < pos.x ||
        room.y + room.type.height < pos.y
      );
    });
    if(roomMatch) {
      return true;
    }
    return false;
  }
  fillWithMaze() {
    // for every other tile
    for(let x = 1; x < this.level.map.tiles.length; x+=2) {
      for(let y = 1; y < this.level.map.tiles[0].length; y+=2) {
        // if this isn't empty wall space, don't carve a maze here
        if(!this.level.map.isWall(x, y) || this.pointInRoom({x, y})) { 
          continue;
        }
        this.growMazeFromPoint({x, y});
      }
    }
  }
  growMazeFromPoint(start) {
    this.regionCount++;
    let cells = [];
    this.carve(start);
    cells.push(start);
    
    let lastDir = null;
    
    while(cells.length > 0) {
      let cell = cells[cells.length - 1];
      
      
      let openCells = [Direction.Up, Direction.Down, Direction.Left, Direction.Right].filter(dir => this.validCarve(cell, dir));
      
      if(openCells.length > 0) {
        let dir;
        if(openCells.includes(lastDir) && Math.random() > MAZE_WINDING_CHANCE) {
          dir = lastDir;
        }
        else {
          dir = openCells[Math.floor(Math.random() * openCells.length)];
        }
        
        this.carve(dir.apply(cell));
        this.carve(dir.scale(2).apply(cell));
        cells.push(dir.scale(2).apply(cell));
        
        lastDir = dir;
      }
      else {
        cells.splice(cells.length - 1, 1);
        lastDir = null;
      }
    }
  }
  carve(pos) {
    this.level.map.tiles[pos.x][pos.y] = ' ';
    this.regions[pos.x][pos.y] = this.regionCount;
  }
  carveDoor(pos) {
    return this.carve(pos); // temp? maybe put doors here in the future
  }
  validCarve(pos, dir) {
    let endPoint = dir.scale(3).apply(pos);
    if(!this.level.map.contains(endPoint.x, endPoint.y)) {
      return false;
    }
    let destination = dir.scale(2).apply(pos);
    return this.level.map.isWall(destination.x, destination.y);
  }
  
  connectRegions() {
    let connectorRegions = new Map();
    
    for(let x = 1; x < this.level.map.tiles.length - 1; x++) {
      for(let y = 1; y < this.level.map.tiles[0].length - 1; y++) {
        if(!this.level.map.isWall(x, y)) { 
          continue;
        }
        let pos = {x, y};
        
        let regions = new Set();
        [Direction.Up, Direction.Down, Direction.Left, Direction.Right].forEach(dir => {
          let check = dir.apply(pos);
          let region = this.regions[check.x][check.y];
          if(region !== undefined) {
            regions.add(region);
          }
        });
        
        if(regions.length < 2) {
          continue;
        }
        connectorRegions.set(pos, regions);
      }
    }
    
    let connectors = Array.from(connectorRegions.keys());
    
    let merged = {};
    let openRegions = new Set();
    for(let i = 0; i <= this.regionCount; i++) {
      openRegions.add(i);
      merged[i] = i;
    }
    
    while(openRegions.size > 1 && connectors.length > 0) {
      let connector = connectors[Math.floor(Math.random() * connectors.length)];
      this.carveDoor(connector);
      
      let regions = Array.from(connectorRegions.get(connector)).map(region => merged[region]);
      let dest = regions[0];
      let sources = regions.slice(1, regions.length);
      
      // merge it all together
      for(let i = 0; i <= this.regionCount; i++) {
        if(sources.includes(merged[i])) {
          merged[i] = dest;
        }
      }
      
      sources.forEach(nowDoneRegion => openRegions.delete(nowDoneRegion));
      
      connectors = connectors.filter(pos => {
        if(new Direction(pos.x, pos.y).distance(connector) < 3) {
          return false;
        }
        let regions = new Set(Array.from(connectorRegions.get(pos)).map(region => merged[region]));
        
        if(regions.size > 1) {
          return true;
        }
        
        return false;
      });
    }
  }
  removeDeadEnds() {
    let done = false;
    while(!done) {
      done = true;
      for(let x = 1; x < this.level.map.tiles.length - 1; x++) {
        for(let y = 1; y < this.level.map.tiles[0].length - 1; y++) {
          if(this.level.map.isWall(x, y)) {
            continue;
          }
          let pos = {x, y};
          let exits = 0;
          [Direction.Up, Direction.Down, Direction.Left, Direction.Right].forEach(dir => {
            let check = dir.apply(pos);
            if(!this.level.map.isWall(check.x, check.y)) {
              exits++;
            }
          });
          
          if(exits != 1) {
            continue;
          }
          
          done = false;
          this.level.map.tiles[x][y] = 'x';
        }
      }
    }
  }
}

export default LevelGen;