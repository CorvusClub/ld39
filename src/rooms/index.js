import TileMap from '../lib/tilemap';

const rooms = [
  require('./cross'),
  require('./slalom'),
  require('./cover'),
  require('./diamond'),
  require('./vert_tunnel'),
  require('./horiz_tunnel'),
];

export default rooms.map(TileMap.parseString);