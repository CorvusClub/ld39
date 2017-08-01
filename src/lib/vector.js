class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(otherVec) {
    this.x += otherVec.x;
    this.y += otherVec.y;
    return this;
  }
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  unit() {
    if(this.length === 0) {
      return new Vector(0, 0);
    }
    return new Vector(this.x / this.length, this.y / this.length);
  }
  set(otherVec) {
    this.x = otherVec.x;
    this.y = otherVec.y;
  }
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}


export default Vector;