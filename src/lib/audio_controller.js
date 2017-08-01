class AudioController {
  constructor() {
    this.cordSounds = {};
    this.chargeSounds = {};
    this.engineSounds = {};
    
    this.cordSounds["retract"] = this.loadAudio("cord/retract.ogg");
    this.cordSounds["fire"] = this.loadAudio("cord/extend.ogg");
    this.cordSounds["impact"] = this.loadAudio("cord/temp_impact.ogg");
    this.chargeSounds["charging"] = this.loadAudio("getting charged Long.ogg");
    this.chargeSounds["zap"] = this.loadAudio("Squelch/Squelch 2.ogg");
    this.chargeSounds["zap"].volume = 1;
    this.engineSounds["startup"] = this.loadAudio("engine chug loop/engine chug startup.mp3");
    this.engineSounds["loop"] = this.loadAudio("engine chug loop/engine chug loop maybe.ogg");
    this.engineSounds["stop"] = this.loadAudio("engine chug loop/engine chug stop.mp3");
    this.engineSounds["startup"].volume = 0.7;
    this.engineSounds["loop"].volume = 0.7;
    this.engineSounds["stop"].volume = 0.7;
    this.engineSounds["loop"].loop = true;
  }
  loadAudio(name) {
    let audio = document.createElement("audio");
    audio.src = `./static/audio/${name}`;
    audio.volume = 0.3;
    return audio;
  }
  
  startEngine() {
    this.engineSounds["startup"].play();
    this.engineSounds["startup"].addEventListener("ended", () => {
      this.engineSounds["loop"].play()
    })
  }
  stopEngine() {
    if(!this.engineSounds["loop"].paused) {
      this.engineSounds["loop"].pause();
      this.engineSounds["stop"].play();
    }
  }
  stopCordSounds() {
    for(let key in this.cordSounds) {
      this.cordSounds[key].pause();
    }
  }
  retract() {
    this.cordSounds["retract"].play();
  }
  fire() {
    this.cordSounds["fire"].play();
  }
  impact() {
    this.cordSounds["impact"].play();
  }
  charge() {
    this.chargeSounds["charging"].currentTime = 0;
    this.chargeSounds["charging"].play();
  }
  zap() {
    this.chargeSounds["zap"].currentTime = 0;
    this.chargeSounds["zap"].play();
  }
}

let audio = new AudioController();

export default audio;