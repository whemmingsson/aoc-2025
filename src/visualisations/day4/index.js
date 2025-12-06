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

const removeRolls = (m, toRemove) => {
  toRemove.forEach((a) => {
    m.setValue(a.r, a.c, "x");
  });
  return toRemove.length;
};

const renderMatrix = () => {
  if (!matrix) return;

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
  isRemoving = true;
  let interval = (1 / toRemove.length) * 20;
  console.log(interval);
  for (let i = 0; i < toRemove.length; i++) {
    const a = toRemove[i];

    fill(0);
    rect(a.c * CELL_SIZE, a.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    if (i % interval === 0) await sleep(1);
  }
  isRemoving = false;
};

function setup() {
  createCanvas(rows * CELL_SIZE, cols * CELL_SIZE);
  stroke(50);

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
