import { Puzzle, SourceType } from "../Puzzle";

const labels: Map<number, string> = new Map();
labels.set(0, "A");
labels.set(1, "B");
labels.set(2, "C");
labels.set(3, "D");
labels.set(4, "E");
labels.set(5, "F");

class Grid {
  width: number;
  height: number;
  order: number[];
  shapes: Shape[];

  constructor(w: number, h: number, order: number[]) {
    this.width = w;
    this.height = h;
    this.order = order;
    this.shapes = [];
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

  print() {
    console.log(`Grid ${this.width}x${this.height}`);
    const groups = this.shapes.groupBy((e) => e.getLabel());
    console.log(
      "Order:",
      groups.map((g) => `${g.label as string}:${g.elements.length}`)
    );
  }
}

class Shape {
  matrix: number[][];
  id: number;
  label: string;
  rows: string[];
  constructor(id: number, label: string, rows: string[]) {
    this.id = id;
    this.label = label;
    this.matrix = [];
    this.rows = rows;
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
        console.log(r.map((c) => (c === 1 ? this.label : " ")).join(""));
      } else {
        console.log(r.join(""));
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

  rotate() {
    // Rotate the shape 90 deg CW
  }

  flipOnY() {
    // Flip on the y-axis
    const rowsCopy = [...this.rows];
    const tmp = rowsCopy[0]!;
    rowsCopy[0] = rowsCopy[2]!;
    rowsCopy[2] = tmp;
    this._constructMatrix(rowsCopy);
  }

  flipOnX() {
    // Flip on the x-axis
    const rowsCopy: string[] = [];
    for (let r = 0; r < this.rows.length; r++) {
      let rr = this.rows[r]!;
      let newRow = rr[2]! + rr[1]! + rr[0];
      rowsCopy.push(newRow);
    }
    this._constructMatrix(rowsCopy);
  }

  reset() {
    this._constructMatrix(this.rows);
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

  // Testing
  shapes[0]?.flipOnY();
  shapes[0]?.flipOnX();
  shapes[0]?.print(true);
};

const puzzle = new Puzzle(12, solveFunc, SourceType.STRING_ARRAY, true);
export default puzzle;
