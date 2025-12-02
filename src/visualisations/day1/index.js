let dialGraphics;
let dialCreated = false;
let angle;
let animation = {
  isRotating: false,
  isRunning: false,
};
let instructions = [];
let instructionIndex = 0;
let instructionCounter = 0;
let zeroCounter = 0;
let currentAngle = 0;
let speed = 1;
let isColoringZero = false;
let coloringZeroMaxFrameCount = 20;
let coloringZeroCurrentFrame = 0;

const parseData = () => {
  const regex = /(R|L)(\d+)/;
  for (const row of data.split("\n")) {
    const instruction = regex.exec(row);
    if (!instruction) continue;
    instructions.push({
      direction: instruction[1],
      steps: parseInt(instruction[2]),
    });
  }
};

const isAtZero = (angle) => {
  const angleDegs = Math.round((angle * 180) / PI) % 360;
  return angleDegs === 0;
};

function setup() {
  createCanvas(600, 600);
  ellipseMode(CENTER);
  //rectMode(CENTER);
  angle = TWO_PI / 100;
  currentAngle = 50 * angle;

  parseData();
  console.log(instructions);
}

const shouldReset = () => {
  return instructionCounter >= instructions[instructionIndex].steps;
};

const resetAndTakeNext = () => {
  instructionCounter = 0;
  instructionIndex++;

  if (instructionIndex >= instructions.length) {
    console.log("Stop");
    noLoop();
  } else {
    console.log(
      instructions[instructionIndex].direction,
      instructions[instructionIndex].steps
    );
  }
};

const handleReset = () => {
  if (shouldReset()) {
    resetAndTakeNext();
  }
};

const drawDialToGraphics = (graphics) => {
  if (!graphics) return;

  graphics.translate(graphics.width / 2, graphics.height / 2);
  graphics.ellipseMode(CENTER);

  graphics.fill(0);
  graphics.circle(0, 0, 400);

  graphics.fill(255);
  for (let i = 0; i < 100; i++) {
    let h = 10;
    if (i % 10 === 0) {
      h = 20;
    }
    let w = 6;
    graphics.rect(-w / 2, -200, w, h);
    graphics.rotate(angle);
  }
};

const drawHandle = () => {
  rotate(currentAngle);
  fill(255);
  triangle(0, -175, -50, -140, 50, -140);
  stroke(255);
  fill(50);
  circle(0, 0, 300);
};

const drawCounter = () => {
  push();
  textAlign(RIGHT);
  fill(255);
  textSize(50);
  translate(width / 2 - 50, height / 2 - 50);
  text(zeroCounter, 0, 0);
  pop();
};

const startColoringZeroTick = () => {
  isColoringZero = true;
  coloringZeroCurrentFrame = 0;
};

const increaseColoringZeroFrame = () => {
  if (isColoringZero) {
    coloringZeroCurrentFrame++;
  }
};

const handleStopColoringZeroTick = () => {
  if (coloringZeroCurrentFrame === coloringZeroMaxFrameCount) {
    isColoringZero = false;
  }
};

const rotateHandle = () => {
  if (!animation.isRunning) {
    return;
  }
  let c = instructions[instructionIndex];
  if (c.direction === "R") {
    currentAngle += angle;
  } else {
    currentAngle -= angle;
  }
  instructionCounter++;

  if (isAtZero(currentAngle)) {
    startColoringZeroTick();
    zeroCounter++;
  }
};

function keyPressed() {
  if (key === " ") {
    animation.isRunning = !animation.isRunning;
  }
}

const drawZeroTick = () => {
  rotate(0);
  if (isColoringZero) {
    let from = color(255, 0, 0);
    let to = color(255, 255, 255);
    let c = map(coloringZeroCurrentFrame, 0, coloringZeroMaxFrameCount, 0, 1);
    let lC = lerpColor(from, to, c);
    fill(lC);
  } else {
    fill(255);
  }
  let h = 20;
  let w = 6;
  rect(-w / 2, -200, w, h);
};

function draw() {
  background(0);

  // Create the dial graphics on first frame
  if (!dialCreated) {
    dialGraphics = createGraphics(600, 600);
    if (dialGraphics) {
      drawDialToGraphics(dialGraphics);
      dialCreated = true;
    }
  }

  // Draw the pre-rendered dial
  if (dialGraphics) {
    image(dialGraphics, 0, 0);
  }

  translate(width / 2, height / 2);

  push();
  if (animation.isRunning) {
    for (let s = 0; s < speed; s++) {
      rotateHandle();
      handleReset();
    }
  }

  drawZeroTick();
  drawHandle();
  pop();
  drawCounter();

  if (isColoringZero) {
    increaseColoringZeroFrame();
    handleStopColoringZeroTick();
  }
}
