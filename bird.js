var G = 0.4;
var JUMP_INIT_SPEED = -5;

var Bird = function(x, y, vx, vy, brain) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.fitness = 0;
  this.dead = false;
  if (brain) {
    this.brain = brain;
  } else {
    this.brain = new Genome(8, 6, 1);
    this.brain.initWeights();
  }
  this.data = [];
}

Bird.prototype.move = function() {
  this.x += this.vx;
  this.vy += G;
  this.y += this.vy;

  if (this.y > 500) {
    this.y = 500;
  }

  if (this.y < 0) {
    this.y = 0;
    this.vy = 0;
  }

  this.fitness += 10;
}

Bird.prototype.collides = function(pipe) {
  return (this.x + 35 >= pipe.x && pipe.x + 62 >= this.x && (this.y + 10 <= pipe.top || this.y + 30 >= pipe.bottom));
}

Bird.prototype.think = function(pipe0, pipe1) {
  var closest;

  if (pipe0.x + 62 < this.x) {
    closest = pipe1;
  } else if (pipe1.x + 62 < this.x) {
    closest = pipe0;
  } else if (pipe1.x < pipe0.x) {
    closest = pipe1;
  } else {
    closest = pipe0;
  }

  var other = closest == pipe0 ? pipe1 : pipe0;

  var inputs = [];
  inputs[0] = this.y / 600;
  inputs[1] = (this.y - closest.top) / 600;
  inputs[2] = (closest.bottom - this.y) / 600;
  inputs[3] = (closest.x - this.x) / 300;
  inputs[4] = (this.y - other.top) / 600;
  inputs[5] = (other.bottom - this.y) / 600;
  inputs[6] = (other.x - this.x) / 300;
  inputs[7] = this.vy / 10;

  this.prevDecision = 0;

  var nextWithoutFlap = this.y + this.vy;

  if (inputs[1] < 0) {
    this.brain.train(inputs, [0.3 + inputs[1]]);
  } else if (inputs[2] < 0) {
    this.brain.train(inputs, [0.7 - inputs[2]]);
  }

  if (nextWithoutFlap > 500) {
    this.brain.train(inputs, [1]);
  }

  var partial = this.x - 250 > 0 ? (this.x - 250) % 200 : 0;
  var a = this.brain.think(inputs)[0][0];

  if (a > 0.6) {
    if (partial > 0 && partial <= 120) {
      this.data.push([inputs, Math.max(0.65, a)]);
    }
    this.flap();
  } else if (a < 0.45) {
    if (partial > 0 && partial <= 120) {
      this.data.push([inputs, Math.min(0.4, a)]);
    }
  } else {
    if (partial > 0 && partial <= 120) {
      this.data.push([inputs, a]);
    }
  }
}

Bird.prototype.flap = function() {
  this.vy = JUMP_INIT_SPEED;
}

Bird.prototype.checkDead = function(pipe0, pipe1) {
  if (this.dead) {
    return true;
  }

  if (this.y == 500) {
    this.fitness -= 100;
    this.dead = true;
    return true;
  }

  var pipeCollide = null;
  if (this.collides(pipe0)) {
    pipeCollide = pipe0;
  } else if (this.collides(pipe1)) {
    pipeCollide = pipe1;
  }

  if (!pipeCollide) {
    return false;
  }

  var pipeTopDistance = Math.abs(this.y - pipeCollide.top);
  var pipeBottomDistance = Math.abs(this.y - pipeCollide.bottom);

  this.dead = true;
  this.fitness -= (pipeTopDistance + pipeBottomDistance) / 100;
  return true;
}
