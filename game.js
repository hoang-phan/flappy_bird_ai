var getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var numBirds = 50;
var bestFitness = 0;
var bestBrain = null;
var mutateRate = 0.2;
var birds = [];
var pipe0;
var pipe1;
var scene;
var restartable;
var gameEnd;
var birdImgs = [];
var birdsLayer = document.getElementById('birds-layer');
var sceneDiv = document.getElementById('scene');
var pipe0Div = document.getElementsByClassName('pipe')[0];
var pipe0Inner = pipe0Div.children[0];
var pipe1Div = document.getElementsByClassName('pipe')[1];
var pipe1Inner = pipe1Div.children[0];
var gameEndDiv = document.getElementById('game-end');
var gamePointDiv = document.getElementById('game-point');

var initPipeAndScene = function() {
  pipe0 = new Pipe(300);
  pipe1 = new Pipe(500);
  scene = new Scene(140, 2);
  gameEnd = false;
  restartable = false;
}

var startGame = function() {
  for (var i = 0; i < numBirds; i++) {
    var birdImg = document.createElement('IMG');
    birdImg.src = 'bird.png';
    birdImg.style.position = 'absolute';
    birdImg.id = 'bird' + i;
    birdsLayer.appendChild(birdImg);
  }

  for (var i = 0; i < numBirds; i++) {
    birds[i] = new Bird(0, 0, 2, 0);
    birdImgs[i] = document.getElementById('bird' + i);
  }
  initPipeAndScene();
}

var nextGenerationGame = function() {
  chooseBestInGeneration();

  for (var i = 0; i < numBirds; i++) {
    var copiedBrain = bestBrain.makeCopy();
    copiedBrain.mutate(mutateRate);
    birds[i] = new Bird(0, 0, 2, 0, copiedBrain);
    birdImgs[i].style.display = 'block';
  }

  initPipeAndScene();
}

var chooseBestInGeneration = function() {
  var bestInGen = 0;
  var bestBirdInGen = null;

  for (var i = 0; i < numBirds; i++) {
    if (birds[i].fitness > bestInGen) {
      bestBirdInGen = birds[i];
      bestInGen = birds[i].fitness;
    }
  }

  console.log(bestInGen);
  // make progress
  if (bestInGen > bestFitness) {
    bestFitness = bestInGen;
    bestBrain = bestBirdInGen.brain;
    mutateRate /= 2;
  } else {
    var dataChunkLength = (bestBirdInGen.x - 250) / 200;

    for (var i = 0; i < 60 * dataChunkLength; i++) {
      var trainedData = bestBirdInGen.data[i];
      bestBrain.train(trainedData[0], [trainedData[1]]);
    }
    mutateRate = Math.max(mutateRate * 1.5, 0.4);
  }
  console.log(bestFitness);
}

document.addEventListener('click', function() {
  if (!gameEnd) {
    // bird.flap();
  } else if (restartable) {
    gameEndDiv.style.display = 'none';
    startGame();
    gameUpdate();
  }
});

var gamePoint = function() {
  return 140 - scene.x > 300 ? Math.floor(((140 - scene.x) + 300) / 200) : 0;
}

var update = function() {
  for (var i = 0; i < numBirds; i++) {
    if (birds[i].dead) {
      continue;
    }
    birds[i].move();
    birds[i].think(pipe0, pipe1);
  }

  scene.move();
  pipe0.move(scene);
  pipe1.move(scene);
  
  var allDead = true;

  for (var i = 0; i < numBirds; i++) {
    if (!birds[i].checkDead(pipe0, pipe1)) {
      allDead = false;
    }
  }

  if (allDead) {
    nextGenerationGame();
  }
}

var render = function() {
  for (var i = 0; i < numBirds; i++) {
    if (birds[i].checkDead(pipe0, pipe1)) {
      birdImgs[i].style.display = 'none';
    } else {
      birdImgs[i].style.left = (birds[i].x + scene.x) + 'px';
      birdImgs[i].style.top = birds[i].y + 'px';
      birdImgs[i].style.transform = 'rotateZ(' + (birds[i].vy * 2) + 'deg)'  
    }
  }

  sceneDiv.style.backgroundPositionX = scene.x + 'px'
  pipe0Div.style.left = (pipe0.x + scene.x) + 'px'
  pipe0Inner.style.top = pipe0.y + 'px'
  pipe1Div.style.left = (pipe1.x + scene.x) + 'px'
  pipe1Inner.style.top = pipe1.y + 'px'
  gamePointDiv.innerHTML = gamePoint();
}

var gameUpdate = function() {
  update();
  render();
  if (gameEnd) {
    gameEndDiv.style.display = 'block';
  } else {
    setTimeout(gameUpdate, 5);
  }
}

startGame();
gameUpdate();

