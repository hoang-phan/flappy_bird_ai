var Pipe = function(x) {
  this.x = x;
  this.initY();
}

Pipe.prototype.move = function(scene) {
  if (this.x + scene.x < -100) {
    this.x += 400;
    this.initY();
  }
}

Pipe.prototype.initY = function() {
  this.y = Math.round(random(-510, -160));
  this.top = this.y + 546;
  this.bottom = this.y + 700;
}
