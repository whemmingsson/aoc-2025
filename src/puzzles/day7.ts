import { Matrix } from "../matrix";
import { Puzzle, SourceType } from "../Puzzle";
import { Delimiters, forN } from "../utils";

interface Position {
  col: number;
  row: number;
}

interface Beam {
  position: Position;
}

let matrix: Matrix<string>;

let beams: Beam[] = [];
let splitCounter = 0;

const isSplitterAt = (row: number, col: number) => {
  return matrix.getElement(row, col) === "^";
};

const shouldSplitBeam = (b: Beam) => {
  return isSplitterAt(b.position.row, b.position.col);
};

const moveBeams = () => {
  beams.forEach((b) => (b.position.row += 1));
};

const markBeamsInMatrix = () => {
  beams
    .filter((b) => matrix.isInBound(b.position.row, b.position.col))
    .forEach((b) => matrix.setValue(b.position.row, b.position.col, "|"));
};

const getBeamsToSplit = () => {
  return beams.filter(shouldSplitBeam);
};

const getStarterBeam = (): Beam => {
  const positionOfS = matrix.getRow(0)?.indexOf("S")!;
  const pos = { col: positionOfS, row: 1 };
  return { position: pos };
};

const splitBeams = (toSplit: Beam[]) => {
  toSplit.forEach((b) => {
    splitBeam(b);
    splitCounter++;
  });
};

const areEqual = (a: Beam, b: Beam) => {
  return a.position.col === b.position.col && a.position.row === b.position.row;
};

const mergeBeams = () => {
  const duplicateIndecies = new Set<number>();
  for (let i = 0; i < beams.length - 1; i++) {
    let target = beams[i]!;
    for (let j = i + 1; j < beams.length; j++) {
      let beam = beams[j]!;
      if (beam === target) continue;

      if (areEqual(target, beam) && !duplicateIndecies.has(j)) {
        // beam is a duplicate of target, mark it for removal
        duplicateIndecies.add(j);
      }
    }
  }
  if (duplicateIndecies.size === 0) return 0;

  // Shenanigans
  const indecies: number[] = [];
  duplicateIndecies.forEach((i) => indecies.push(i));
  indecies.sort((a, b) => b - a);
  indecies.forEach((i) => {
    beams.splice(i, 1);
  });

  return duplicateIndecies.size;
};

const splitBeam = (b: Beam) => {
  const indexOfBeam = beams.indexOf(b);

  let posBeamLeft = { col: b.position.col - 1, row: b.position.row };
  let beamLeft: Beam = { position: posBeamLeft };

  let posBeamRight = { col: b.position.col + 1, row: b.position.row };
  let beamRight: Beam = { position: posBeamRight };

  //Remove the current beam
  beams.splice(indexOfBeam, 1);

  //Add new beams
  beams.push(...[beamLeft, beamRight]);
};

const solvePartOne = (d: any) => {
  matrix = d.data as Matrix<string>;
  beams = [];
  splitCounter = 0;

  // Get starter beam
  beams.push(getStarterBeam());
  const totalIterations = matrix.getDimensions().rows;
  for (let i = 1; i < totalIterations; i++) {
    moveBeams();
    const beamsToSplit = getBeamsToSplit();
    if (beamsToSplit.length > 0) {
      splitBeams(beamsToSplit);
    }
    mergeBeams();
  }

  console.log("Part 1:", splitCounter);
};

const buildNumberMatrix = (oldMatrix: Matrix<string>) => {
  let data = oldMatrix.getData();
  let newData: number[][] = [];
  for (let r = 0; r < data.length; r++) {
    let row: number[] = [];
    for (let c = 0; c < data[r]!.length; c++) {
      if (data![r]![c] && data![r]![c] === ".") {
        row.push(0);
      }

      if (data![r]![c] && data![r]![c] === "S") {
        row.push(-100);
      }

      if (data![r]![c] && data![r]![c] === "^") {
        row.push(-1);
      }
    }
    newData.push(row);
  }

  return new Matrix<number>(newData);
};

const solvePartTwo = (d: any) => {
  matrix = d.data as Matrix<string>;
  let m = buildNumberMatrix(matrix);
  let starterBeam = getStarterBeam();
  m.setValue(starterBeam.position.row, starterBeam.position.col, 1);

  for (let r = 2; r < m.getDimensions().rows; r++) {
    let row = m.getRow(r)!;

    for (let c = 0; c < row.length; c++) {
      let above = m.getElement(r - 1, c) ?? 0;
      if (row[c] === 0 && above !== -1) {
        m.setValue(r, c, above);
      }
    }
    for (let c = 0; c < row.length; c++) {
      if (row[c] === -1) {
        m.setValue(r, c - 1, m.getElement(r, c - 1)! + m.getElement(r - 1, c)!);
        m.setValue(r, c + 1, m.getElement(r, c + 1)! + m.getElement(r - 1, c)!);
      }
    }
  }

  console.log(
    "Part 2:",
    m
      .getRow(m.getDimensions().rows - 1)
      ?.filter((v) => v > 0)
      .sum()
  );
};

const solveFunc = async (d: any) => {
  //solvePartOne(d);
  solvePartTwo(d);
};

const puzzle = new Puzzle(
  7,
  solveFunc,
  SourceType.STRING_MATRIX,
  false,
  Delimiters.EMPTY
);
export default puzzle;
