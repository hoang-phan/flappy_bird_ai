GenomeStrategies = {
  tanh: {
    activation: function(x) {
      return Math.tanh(x);
    },
    derivative: function(x) {
      return 1 - Math.pow(x, 2);
    }
  },
  sigmoid: {
    activation: function(x) {
      return 1 / (1 + Math.exp(-x));
    },
    derivative: function(x) {
      return x * (1 - x);
    }
  }
}

var deepArrayCopy = function(src) {
  return JSON.parse(JSON.stringify(src));
}

var random = function(min, max) {
  return min + (max - min) * Math.random();
}

var Genome = function(inputLength, hiddenLength, outputLength, hiddenStrategy, outputStrategy) {
  this.inputLength = inputLength;
  this.hiddenLength = hiddenLength;
  this.outputLength = outputLength;
  this.hiddenStrategy = GenomeStrategies[hiddenStrategy || 'sigmoid'];
  this.outputStrategy = GenomeStrategies[outputStrategy || 'sigmoid'];
  this.inputsWeights = [];
  this.hiddensWeights = [];
  this.hiddensBias = [];
  this.outputsBias = [];
}

Genome.prototype.initWeights = function() {
  if (this.inputsWeights.length > 0) {
    return;
  }

  for (var i = 0; i < this.hiddenLength; i++) {
    this.inputsWeights[i] = [];
    
    for (var j = 0; j < this.inputLength; j++) {
      this.inputsWeights[i][j] = random(-1, 1);
    }
    this.hiddensBias[i] = random(-1, 1);
  }

  for (var i = 0; i < this.outputLength; i++) {
    this.hiddensWeights[i] = [];

    for (var j = 0; j < this.hiddenLength; j++) {
      this.hiddensWeights[i][j] = random(-1, 1);
    }
    this.outputsBias[i] = random(-1, 1);
  }
}

Genome.prototype.makeCopy = function() {
  var copy = new Genome(this.inputLength, this.hiddenLength, this.outputLength);
  copy.hiddenStrategy = this.hiddenStrategy;
  copy.outputStrategy = this.outputStrategy;
  copy.inputsWeights = deepArrayCopy(this.inputsWeights);
  copy.hiddensWeights = deepArrayCopy(this.hiddensWeights);
  copy.hiddensBias = deepArrayCopy(this.hiddensBias);
  copy.outputsBias = deepArrayCopy(this.outputsBias);
  return copy;
}

Genome.prototype.calculate = function(inputs, weights, bias) {
  output = bias;
  for (var i = 0; i < inputs.length; i++) {
    output += inputs[i] * weights[i];
  }
  return output;
}

Genome.prototype.feedForward = function(inputs, weights, bias, strategy) {
  return strategy.activation(this.calculate(inputs, weights, bias));
}

Genome.prototype.think = function(inputs) {
  hiddens = [];
  for (var i = 0; i < this.hiddenLength; i++) {
    hiddens[i] = this.feedForward(inputs, this.inputsWeights[i], this.hiddensBias[i], this.hiddenStrategy);
  }

  outputs = []
  for (var i = 0; i < this.outputLength; i++) {
    outputs[i] = this.feedForward(hiddens, this.hiddensWeights[i], this.outputsBias[i], this.outputStrategy);
  }

  return [outputs, hiddens];
}

Genome.prototype.mutate = function(maxMutateRatio) {
  for (var i = 0; i < this.hiddenLength; i++) {
    for (var j = 0; j < this.inputLength; j++) {
      this.inputsWeights[i][j] += random(-maxMutateRatio, maxMutateRatio);
    }
    this.hiddensBias[i] += random(-maxMutateRatio, maxMutateRatio);
  }

  for (var i = 0; i < this.outputLength; i++) {
    for (var j = 0; j < this.hiddenLength; j++) {
      this.hiddensWeights[i][j] += random(-maxMutateRatio, maxMutateRatio);
    }
    this.outputsBias[i] += random(-maxMutateRatio, maxMutateRatio);
  }
}

Genome.prototype.train = function(inputs, outputs) {
  var thinks = this.think(inputs);
  var hiddens = thinks[1];
  var predictions = thinks[0];

  var errors = [];
  var hiddenErrors = [];
  var delta;

  for (var i = 0; i < this.outputLength; i++) {
    errors[i] = outputs[i] - predictions[i];
    delta = errors[i] * this.outputStrategy.derivative(predictions[i]);

    for (var j = 0; j < this.hiddenLength; j++) {
      this.hiddensWeights[i][j] += delta * hiddens[j];
    }
  }

  for (var j = 0; j < this.hiddenLength; j++) {
    hiddenErrors[j] = 0;

    for (var i = 0; i < this.outputLength; i++) {
      hiddenErrors[j] += errors[i] * this.hiddensWeights[i][j];
    }
  }

  for (var i = 0; i < this.hiddenLength; i++) {
    delta = hiddenErrors[i] * this.hiddenStrategy.derivative(hiddens[i]);

    for (var j = 0; j < this.inputLength; j++) {
      this.inputsWeights[i][j] += delta * inputs[j];
    }
  }
}
