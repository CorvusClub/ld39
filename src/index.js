import Level from './lib/level';
import Renderer from './lib/renderer';
import input from './lib/input';

import {GRID_SIZE} from './lib/tilemap';

import audio from './lib/audio_controller';


const display = document.getElementById("display");

let renderer = new Renderer(display);
window.renderer = renderer;
let levelCount = 0;
let level;

window.nextLevel = function() {
  let playerPower = 100;
  let timeSurvived = 0;
  if(level) {
    playerPower = level.player.batteryLevel;
    timeSurvived = level.timeAlive;
  }
  else {
    renderer.fadeIn = 1500;
  }
  
  levelCount++;
  level = Level.generate();
  level.count = levelCount;
  level.player.batteryLevel = playerPower;
  level.timeAlive = timeSurvived;
  renderer.level = level;
};

window.gameOver = function() {
  renderer.fadeTimer = 1500;
  renderer.fade = true;
  audio.stopEngine();
  level.player.destroyed = true;
  renderer.gameOver = true;
  setTimeout(() => {
    input.once("mousedown", () => {
      level.player.batteryLevel = 100;
      level.timeAlive = 0;
      level.count = 0;
      renderer.fade = false;
      renderer.fadeTimer = 0;
      audio.startEngine();
      window.nextLevel();
    });
  }, 1000);
};

window.nextLevel();

input.camera = renderer.camera;

let lastTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  
  let dt = time - lastTime;
  
  if(dt > 500) {
    dt = 32;
  }
  
  if(input.mousedown) {
    input.mousedowntime += dt;
  }
  level.update(dt);
  
  renderer.camera.focusEnt(level.player);
  
  renderer.update(dt);
  
  
  lastTime = time;
}

requestAnimationFrame(animate);


function onResize() {
  display.width = window.innerWidth;
  display.height = window.innerHeight;
  
  let smaller = display.width;
  if(display.height < display.width) {
    smaller = display.height;
  }
  
  renderer.camera.scale = ((smaller / 16) / GRID_SIZE);
}

window.addEventListener("resize", onResize);

onResize();

window.animate = animate;

audio.startEngine();