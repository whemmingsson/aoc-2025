let animation = {
  isRunning: false,
  completed: false,
};

let CELL_SIZE = 8;
let rows = 135;
let cols = 135;

let matrix = null;

// a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration) {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  });
}

const parseData = async () => {
  let raw = data;
  matrix = await AOC.buildStringMatrix(raw, "");
};

const findRollsToRemove = (m) => {
  const toRemove = [];
  m.foreach((rI, cI) => {
    if (m.getElement(rI, cI) !== "@") return;
    const adjacent = m.getAdjacent(rI, cI).filter((m) => m.value === "@");

    if (adjacent.length < 4) {
      toRemove.push({ r: rI, c: cI });
    }
  });
  return toRemove;
};

function shuffle(array) {
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

const removeRolls = (m, toRemove) => {
  toRemove.forEach((a) => {
    m.setValue(a.r, a.c, "x");
  });
  return toRemove.length;
};

const renderMatrix = () => {
  if (!matrix) return;

  stroke(0);
  let renderFunc = (r, c, v) => {
    if (v === "@") {
      fill(255);
    } else if (v === "x") {
      fill(50);
    } else {
      fill(0);
    }
    rect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };

  matrix.foreach(renderFunc);
};

let isRemoving = false;
const renderRemovedRolls = async (toRemove) => {
  const toRemovShuffled = shuffle(toRemove);
  isRemoving = true;
  for (let i = 0; i < toRemovShuffled.length; i++) {
    const a = toRemovShuffled[i];

    fill(0);
    rect(a.c * CELL_SIZE, a.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    if (i % 10 === 0) await sleep(2);
  }
  isRemoving = false;
};

function setup() {
  createCanvas(rows * CELL_SIZE, cols * CELL_SIZE);
  stroke(25);

  parseData();
}

function keyPressed() {
  if (key === " ") {
    if (!animation.completed) animation.isRunning = !animation.isRunning;
    else {
      matrix = null;
      parseData();
      animation.isRunning = false;
      matrixRenderedOnce = false;
      iter = 0;
      totalRollsRemoved = 0;
      loop();
      animation.completed = false;
    }
  }
}

let iter = 0;
let totalRollsRemoved = 0;

let matrixRenderedOnce = false;
function draw() {
  //background(0);
  if (matrix && !matrixRenderedOnce) {
    console.log("Matrix rendered once");
    renderMatrix();
    matrixRenderedOnce = true;
  }

  if (matrix && animation.isRunning && !isRemoving) {
    let toRemove = findRollsToRemove(matrix);
    renderRemovedRolls(toRemove);
    let removedCount = removeRolls(matrix, toRemove);

    console.log("Iteration:", iter++, "rolls removed:", removedCount);

    totalRollsRemoved += removedCount;
    if (removedCount === 0) {
      noLoop();
      console.log("Total rolls removed:", totalRollsRemoved);
      animation.completed = true;
    }
  }
}
