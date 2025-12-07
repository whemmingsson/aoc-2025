let animation = {
  isRunning: false,
  completed: false,
};

let CELL_SIZE = 8;
let rows = 142;
let cols = 141;

let matrix = null;
let m;
let r = 0;

const buildNumberMatrixData = (oldMatrix) => {
  let data = oldMatrix.getData();
  let newData = [];
  for (let r = 0; r < data.length; r++) {
    let row = [];
    for (let c = 0; c < data[r].length; c++) {
      if (data[r][c] && data[r][c] === ".") {
        row.push(0);
      }

      if (data[r][c] && data[r][c] === "S") {
        row.push(-100);
      }

      if (data[r][c] && data[r][c] === "^") {
        row.push(-1);
      }
    }
    newData.push(row);
  }

  let contentStr = "";
  for (let i = 0; i < newData.length; i++) {
    for (let j = 0; i < newData[0].length; j++) {
      contentStr += newData[i][j];
    }
  }

  return contentStr;
};

// a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration) {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  });
}

const parseData = async () => {
  let raw = data;
  let rawFixed = raw.replaceAll(".", "0").replace("S", "1").replaceAll("^", 2);
  console.log(rawFixed);
  m = await AOC.buildNumberMatrix(rawFixed, "");
  m.foreach((r, c, v) => {
    if (v === 1) {
      m.set(r, c, -100);
    }
    if (v === 2) {
      m.set(r, c, -1);
    }
  });
};

const setFillBasedOnCell = (v) => {
  if (v === 0) {
    fill(0);
  } else if (v === -1) {
    fill(10);
  } else if (v === -100) {
    fill(0);
  } else {
    let logV = v === 0 ? 0 : Math.log(v);
    let h = map(logV, 0, Math.log(2914940914431), 250, 0);
    fill(h, 360, 90);
  }
};

const renderRow = (row, rowIndex) => {
  console.log("Render", row, "With index", rowIndex);
  row.forEach((c, i) => {
    setFillBasedOnCell(c);
    rect(i * CELL_SIZE, rowIndex * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });
};

const moveDown = () => {
  let row = m.getRow(r);
  for (let c = 0; c < cols; c++) {
    let above = m.get(r - 1, c);
    if (row[c] === 0 && above !== -1) {
      m.set(r, c, above);
    }
  }
};

const calcNextRow = () => {
  let row = m.getRow(r);
  for (let c = 0; c < cols; c++) {
    if (row[c] === -1) {
      m.set(r, c - 1, m.get(r, c - 1) + m.get(r - 1, c));
      m.set(r, c + 1, m.get(r, c + 1) + m.get(r - 1, c));
    }
  }
};

let matrixRenderedOnce = false;
const renderMatrix = () => {
  if (!m || matrixRenderedOnce || !initialized) return;

  let renderFunc = (r, c, v) => {
    setFillBasedOnCell(v);
    if (v === -100) {
      console.log("-100 at", r, c);
    }
    if (v === 1) {
      console.log("1 at", r, c);
    }
    rect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };

  m.foreach(renderFunc);

  matrixRenderedOnce = true;
};

const getStarterBeamPos = () => {
  const positionOfS = m.getRow(0).indexOf(-100);
  const pos = { col: positionOfS, row: 1 };
  return pos;
};

let initialized = false;

function setup() {
  colorMode(HSB);
  createCanvas(rows * CELL_SIZE, cols * CELL_SIZE);
  parseData().then(() => {
    s = getStarterBeamPos();
    console.log("Starter pos", s);
    m.set(s.row, s.col, 1);
    r = 2;
    initialized = true;
    console.log("Initialization complete");
  });
}

let currentSum = () => {
  if (r < 2) return 0;

  return m
    .getRow(r - 1)
    .filter((v) => v >= 0)
    .reduce((a, b) => a + b, 0);
};

function keyPressed() {
  if (key === " ") {
    if (!animation.completed) animation.isRunning = !animation.isRunning;
    else {
    }
  }
}

function draw() {
  if (!initialized) {
    return;
  }
  //background(100);
  renderMatrix();

  fill(0);
  rect(790, 0, 600, 100);
  fill(255);
  textSize(18);
  noStroke();
  let s = currentSum();
  console.log(s);
  text("Dimensions: " + s, 800, 50);

  if (!animation.isRunning) return;

  console.log("Iteration:", r);

  moveDown();
  calcNextRow();
  renderRow(m.getRow(r), r);
  r++;

  if (r === 142) {
    noLoop();
    console.log(m.getLastRow().max());
  }
}
