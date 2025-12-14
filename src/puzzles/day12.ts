import { Puzzle, SourceType } from "../Puzzle";

const labels: Map<number, string> = new Map();
labels.set(0, "A");
labels.set(1, "B");
labels.set(2, "C");
labels.set(3, "D");
labels.set(4, "E");
labels.set(5, "F");

interface Position {
  x: number;
  y: number;
}

enum Degrees {
  D90 = 1,
  D180 = 2,
  D270 = 3,
}

const rawPositions: Position[] = [];
rawPositions.push({ x: 0, y: 0 });
rawPositions.push({ x: 1, y: 0 });
rawPositions.push({ x: 2, y: 0 });
rawPositions.push({ x: 0, y: 1 });
rawPositions.push({ x: 1, y: 1 });
rawPositions.push({ x: 2, y: 1 });
rawPositions.push({ x: 0, y: 2 });
rawPositions.push({ x: 1, y: 2 });
rawPositions.push({ x: 2, y: 2 });

const getRawPositions = (s: Shape) => {
  return rawPositions.filter((pos) => s.matrix![pos.y]![pos.x] === 1);
};

class Grid {
  width: number;
  height: number;
  order: number[];
  shapes: Shape[];
  matrix: number[][];
  history: number[][][];

  constructor(w: number, h: number, order: number[]) {
    this.width = w;
    this.height = h;
    this.order = order;
    this.shapes = [];
    this.matrix = [];
    this.history = [];

    this._constructMatrix();
  }

  loadShapes() {
    for (let i = 0; i < this.order.length; i++) {
      let shapeIndex = i;
      let shapeCount = this.order[i]!;

      if (shapeCount === 0) continue;

      let shape = shapes[shapeIndex]!;
      for (let j = 0; j < shapeCount; j++) {
        this.shapes.push(shape.clone());
      }
    }
  }

  setAt(x: number, y: number) {
    this.matrix[y]![x] = 1;
  }

  _constructMatrix() {
    let row = "0"
      .repeat(this.width)
      .split("")
      .map((v) => v.toInt());
    for (let r = 0; r < this.height; r++) {
      this.matrix.push(row);
    }
  }

  resetMatrix() {
    this.matrix = [];
  }

  print() {
    console.log(`Grid ${this.width}x${this.height}`);
    const groups = this.shapes.groupBy((e) => e.getLabel());
    console.log(
      "Order:",
      groups.map((g) => `${g.label as string}:${g.elements.length}`)
    );
  }

  printMatrix() {
    console.log(`Grid ${this.width}x${this.height}`);
    for (let r = 0; r < this.height; r++) {
      console.log(this.matrix[r]!.join(" "));
    }
  }

  canPlaceShapeAt(s: Shape, x: number, y: number) {
    // Construct positions on grid
    const gridPositions = getRawPositions(s).map((gp) => {
      return { x: gp.x + x, y: gp.y + y } as Position;
    });

    return gridPositions.every(
      (gp) =>
        gp.y >= 0 &&
        gp.y < this.height &&
        gp.x >= 0 &&
        gp.x < this.width &&
        this.matrix![gp.y]![gp.x] === 0
    );
  }

  undo() {
    const prevState = this.history.pop();
    if (prevState) {
      this.matrix = prevState;
    } else {
      console.log("Unable to undo! [prev state is undefined]");
    }
  }

  placeShape(s: Shape, x: number, y: number) {
    // Place the current "state" on the history stack
    this.history.push(this.matrix);
    // Assume s can be placed
    getRawPositions(s)
      .map((gp) => {
        return { x: gp.x + x, y: gp.y + y } as Position;
      })
      .forEach((gp) => this.setAt(gp.x, gp.y));
  }
}

class Shape {
  matrix: number[][];
  id: number;
  label: string;
  rows: string[];
  rowsOriginal: string[];
  constructor(id: number, label: string, rows: string[]) {
    this.id = id;
    this.label = label;
    this.matrix = [];
    this.rows = rows;
    this.rowsOriginal = [...rows];
    this._constructMatrix(this.rows);
  }

  _constructMatrix(rows: string[]) {
    this.matrix = [];
    rows.forEach((r) => {
      const row = r.split("").map((c) => (c === "#" ? 1 : 0));
      this.matrix.push(row);
    });
  }

  print(useLabel: boolean = false) {
    console.log(`Piece ${this.id} (${this.label}):`);
    this.matrix.forEach((r) => {
      if (useLabel) {
        console.log(r.map((c) => (c === 1 ? this.label : " ")).join(" "));
      } else {
        console.log(r.join(" "));
      }
    });
    console.log();
  }

  getLabel() {
    return this.label;
  }

  clone(): Shape {
    return new Shape(this.id, this.label, this.rows);
  }

  _getRotatedRows(rows: string[]) {
    const newRows = [];
    newRows.push(rows[2]![0]! + rows[1]![0]! + rows[0]![0]!);
    newRows.push(rows[2]![1]! + rows[1]![1]! + rows[0]![1]!);
    newRows.push(rows[2]![2]! + rows[1]![2]! + rows[0]![2]!);
    return newRows;
  }

  rotate() {
    const newRows = this._getRotatedRows(this.rows);
    this._constructMatrix(newRows);
  }

  rotateDeg(degrees: Degrees) {
    let rows = this.rows;
    for (let i = 0; i < degrees; i++) {
      rows = this._getRotatedRows(rows);
    }
    this.rows = rows;
    this._constructMatrix(rows);
  }

  flipOnY() {
    // Flip on the y-axis
    const rowsCopy = [...this.rows];
    const tmp = rowsCopy[0]!;
    rowsCopy[0] = rowsCopy[2]!;
    rowsCopy[2] = tmp;
    this.rows = rowsCopy;
    this._constructMatrix(rowsCopy);
  }

  flipOnX() {
    // Flip on the x-axis
    const newRows: string[] = [];
    for (let r = 0; r < this.rows.length; r++) {
      let rr = this.rows[r]!;
      let newRow = rr[2]! + rr[1]! + rr[0];
      newRows.push(newRow);
    }
    this.rows = newRows;
    this._constructMatrix(newRows);
  }

  reset() {
    this._constructMatrix(this.rowsOriginal);
  }
}

const printShapes = () => {
  shapes.forEach((p) => p.print(true));
};

const printGrids = () => {
  grids.forEach((p) => p.print());
};

const loadShapes = () => {
  grids.forEach((g) => g.loadShapes());
};

const shapes: Shape[] = [];
const grids: Grid[] = [];

let pieceIndexRegex = /^\d:$/;
let digitRegex = /^\d/;
let gridAndOrderRegex = /(\d+)x(\d+):([(\d+) ]+)/;
const buildDatastrures = (rows: string[]) => {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.trim().match(pieceIndexRegex)) {
      const index = row.trim().match(digitRegex)![0]!.toInt();
      const label = labels.get(index)!;
      const pieceRows: string[] = [];
      for (let i = 0; i < 3; i++) {
        r++;
        pieceRows.push(rows[r]!);
      }
      const p = new Shape(index, label, pieceRows);
      shapes.push(p);
    } else if (row.trim().match(gridAndOrderRegex)) {
      const m = row.trim().match(gridAndOrderRegex);
      const w = m![1]?.toInt()!;
      const h = m![2]?.toInt()!;
      const order = m![3]
        ?.trim()
        .split(" ")
        .map((n) => n.toInt())!;
      const g = new Grid(w, h, order);
      grids.push(g);
    }
  }
};

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  // Setup
  buildDatastrures(rows);
  loadShapes();

  // Debug logging
  printShapes();
  printGrids();
};

const puzzle = new Puzzle(12, solveFunc, SourceType.STRING_ARRAY, true);
export default puzzle;
