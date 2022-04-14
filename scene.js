var Scene = function(x, vx) {
  this.rawX = x;
  this.x = 0;
  this.vx = vx;
}

Scene.prototype.move = function() {
  this.rawX -= this.vx;
  this.x = this.rawX > 0 ? 0 : this.rawX;
}
