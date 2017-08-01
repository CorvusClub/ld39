const LEVEL_WIDTH = 75;
const LEVEL_HEIGHT = 75;
const GRID_SIZE = 64;

class TileMap {
  constructor() {
    this.tiles = new Array(LEVEL_WIDTH);
    for(let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Array(LEVEL_HEIGHT);
      this.tiles[i].fill('x');
    }
  }
  getNearbyWalls(x, y) {
    let tile = this.tiles[x][y];
    let walls = {};
    
    walls.left = x === 0 || this.isWall(x - 1, y);
    walls.right = x === LEVEL_WIDTH - 1 || this.isWall(x + 1, y);
    walls.up = y === 0 || this.isWall(x, y - 1);
    walls.down = y === LEVEL_HEIGHT - 1 || this.isWall(x, y + 1);
    
    return walls;
  }
  isWall(x, y) {
    if(x < 0 || y < 0 || x >= LEVEL_WIDTH || y >= LEVEL_HEIGHT) {
      return true;
    }
    let tile = this.tiles[x][y];
    return TileMap.isWall(tile);
  }
  get(x, y) {
    if(!this.contains(x, y)) {
      return null;
    }
    return this.tiles[x][y];
  }
  contains(x, y) {
    return !(x < 0 || y < 0 || x >= LEVEL_WIDTH || y >= LEVEL_HEIGHT);
  }
  static isWall(tile) {
    if(tile === 'x') {
      return true;
    }
    
    return false;
  }
  
  insertRoom(baseX, baseY, room) {
    for(let x = 0; x < room.width; x++) {
      for(let y = 0; y < room.height; y++) {
        this.tiles[baseX + x][baseY + y] = room.tiles[x][y];
      }
    }
  }
  
  static parseString(inputString) {
    let lines = inputString.split("\n");
    lines.splice(0, 1);
    lines.splice(lines.length - 1, 1);
    let enemySpawns = [];
    let grid = new Array(lines[0].length);
    for(let x = 0; x < grid.length; x++) {
      grid[x] = new Array(lines.length);
      for(let y = 0; y < lines.length; y++) {
        let tile = lines[y][x];
        if(tile === 'o') {
          tile = ' ';
          enemySpawns.push({x, y});
        }
        grid[x][y] = tile;
      }
    }
    return {
      width: grid.length,
      height: lines.length,
      tiles: grid,
      enemySpawns
    };
  }
}


export default TileMap;

export {LEVEL_WIDTH, LEVEL_HEIGHT, GRID_SIZE};