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

interface HistoryEntry {
  matrix: number[][];
  shape: Shape;
}

enum Flipp {
  Y = 0,
  X = 1,
}

interface PlacedState {
  rotation: number | null;
  flipped: Flipp | null;
}

interface State {
  shape: Shape;
  placedStates: PlacedState[];
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
  history: HistoryEntry[];

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

  setAt(x: number, y: number, label?: number) {
    if (this.matrix[y]) {
      this.matrix[y][x] = label ?? 1;
    }
  }

  _constructMatrix() {
    const buildRow = () => {
      return "0"
        .repeat(this.width)
        .split("")
        .map((v) => v.toInt());
    };
    for (let r = 0; r < this.height; r++) {
      this.matrix.push(buildRow());
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
      this.matrix = prevState.matrix;
      prevState.shape.remove();
    } else {
      console.log("Unable to undo! [prev state is undefined]");
    }
  }

  placeShape(s: Shape, x: number, y: number) {
    this.history.push({ matrix: this.matrix, shape: s });
    const rawPositions = getRawPositions(s);
    const positionedPositions = rawPositions.map((gp) => {
      return { x: gp.x + x, y: gp.y + y } as Position;
    });

    positionedPositions.forEach((gp) => {
      this.setAt(gp.x, gp.y, s.id + 1);
    });
    s.place();
  }

  _tryCanPlaceShapeAt(
    shape: Shape,
    position: Position,
    state: PlacedState,
    prevStates: PlacedState[]
  ): boolean {
    const canPlace = () => {
      return this.canPlaceShapeAt(shape, position.x, position.y);
    };

    for (let r = 0; r < 4; r++) {
      state.rotation = r;
      state.flipped = null;

      // Skip this rotation since it's already tried before
      if (prevStates.find((ps) => ps.rotation === r)) continue;

      if (canPlace()) return true;

      shape.flipOnX();
      state.flipped = Flipp.X;
      if (
        canPlace() &&
        !prevStates.find((ps) => ps.rotation === r && ps.flipped === Flipp.X)
      )
        return true;
      shape.flipOnX();

      shape.flipOnY();
      state.flipped = Flipp.Y;
      if (
        canPlace() &&
        !prevStates.find((ps) => ps.rotation === r && ps.flipped === Flipp.Y)
      )
        return true;
      shape.flipOnY();

      shape.rotate();
    }
    //Shape cannot be placed on x,y on any rotation/flipping
    return false;
  }

  isAllShapedPlaced() {
    return this.shapes.every((s) => s.isPlaced);
  }

  canPlaceShapes() {
    const revert = () => {
      // Undoes the state of the grid itself 1 step
      this.undo();
    };

    const getNext = () => {
      return this.shapes.filter((s) => !s.isPlaced).at(0);
    };

    let triedStates: Map<Shape, PlacedState[]> = new Map();
    let stateStack: State[] = [];
    let iter = 0;
    let shape: Shape | undefined = getNext();

    do {
      console.log("Considering shape:", shape?.label);
      if (!shape) {
        return true; // all placed?
      }
      let position = { x: 0, y: 0 };
      let didPlace = false;
      let placedState = {} as PlacedState;

      for (let y = 0; y <= this.height - 3; y++) {
        position.y = y;
        for (let x = 0; x <= this.width - 3; x++) {
          position.x = x;
          if (
            this._tryCanPlaceShapeAt(
              shape,
              position,
              placedState,
              triedStates.has(shape) ? triedStates.get(shape)! : []
            )
          ) {
            this.placeShape(shape, position.x, position.y);

            shape.resetRotationAndFlipping();

            const states = triedStates.get(shape) ?? [];
            states.push(placedState);
            triedStates.set(shape, states);
            stateStack.push({ shape: shape, placedStates: states });

            didPlace = true;
            break;
          }
        }
        if (didPlace) {
          break;
        }
      }

      if (didPlace) {
        console.log(" Placed shape at", position);
        let nextShape = getNext();
        if (!nextShape) {
          // All placed - return!
          return true;
        } else {
          shape = nextShape;
        }
      } else if (!didPlace) {
        console.log(" Could not place shape, stepping back");
        let pushedState = stateStack.pop();
        shape = pushedState?.shape!;
        triedStates.set(shape, pushedState?.placedStates!);
        revert();
      }

      console.log("  Order fulfilled:", this.isAllShapedPlaced());
      if (this.isAllShapedPlaced()) {
        return true;
      }

      iter++;
    } while (true);
  }
}

class Shape {
  matrix: number[][];
  id: number;
  label: string;
  rows: string[];
  rowsOriginal: string[];
  isPlaced: boolean;
  constructor(id: number, label: string, rows: string[]) {
    this.id = id;
    this.label = label;
    this.matrix = [];
    this.rows = rows;
    this.rowsOriginal = [...rows];
    this.isPlaced = false;
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

  place() {
    this.isPlaced = true;
  }

  remove() {
    this.isPlaced = false;
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

  resetRotationAndFlipping() {
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
  //printShapes();
  //printGrids();

  // Test for 1
  const canPlaceAll = grids[1]?.canPlaceShapes();
  console.log(grids[1]!.order, canPlaceAll);
  grids[1]?.printMatrix();
};

const puzzle = new Puzzle(12, solveFunc, SourceType.STRING_ARRAY, true);
export default puzzle;

// Algo
/*

Pick shape
Try shape all possible orientations
if can place -> Place and push state
If can not place:
    if prev shape has unused state:
        go back and try another config 
    if no prev state available: is it over?

    */
