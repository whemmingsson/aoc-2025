import { get } from "http";
import { Puzzle, SourceType } from "../Puzzle";

interface Position {
  x: number;
  y: number;
}

interface Line {
  a: Position;
  b: Position;
}

let positions: Position[] = [];
const positionsSet: Set<string> = new Set();
let lines: Line[] = [];

/* def ccw(A,B,C):
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x)

# Return true if line segments AB and CD intersect
def intersect(A,B,C,D):
    return ccw(A,C,D) != ccw(B,C,D) and ccw(A,B,C) != ccw(A,B,D) */

// Intersection shenaninigans. I did not come up with this.
const ccw = (a: Position, b: Position, c: Position) => {
  return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
};

const intersect = (a: Position, b: Position, c: Position, d: Position) => {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
};

const key = (p: Position) => p.x + "," + p.y;
const isInSet = (p: Position) => positionsSet.has(key(p));
const getArea = (a: Position, b: Position) =>
  (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);

const filterPt1 = (p: Position, position: Position) => {
  return p.x !== position.x && p.y !== position.y;
};

const isInside = (position: Position) => {
  let ray: Line = { a: { x: 0, y: 0 }, b: position };

  const intersectionCount = lines.filter((line) =>
    intersect(ray.a, ray.b, line.a, line.b)
  ).length;

  console.log(
    "      ",
    position,
    "Intersects",
    intersectionCount,
    "times",
    intersectionCount % 2 !== 0 ? "INSIDE" : "OUTSIDE"
  );
  return intersectionCount % 2 !== 0;
};

const filterPt2 = (a: Position, b: Position) => {
  console.log("Inspecting", a, b);
  // Share atleast one x or y => will form av thin rectange
  if (a.x === b.x || a.y === b.y) {
    console.log("  ", "Thin rectangle, area:", getArea(a, b));
    console.log();
    return true;
  }

  const c: Position = { x: a.x, y: b.y };
  const d: Position = { x: b.x, y: a.y };

  console.log("  ", "Other corners", a, b);

  // a, b, c, d are corners of the rectange

  // Both c and d is inside the boundary - the form the cornerns of a valid rectangle
  if (isInSet(d) && isInSet(c)) {
    console.log("    ", "Both in set", a, b, "area", getArea(a, b));
    console.log();
    return true;
  }

  if (isInSet(c)) {
    // c is part of the boundary - is d inside the shape?
    console.log("    ", "only c - running test");
    const inside = isInside(d);
    if (inside) {
      console.log("    ", "Valid rectangle, area", getArea(a, b));
    }
    return inside;
  }

  if (isInSet(d)) {
    // d is part of the boundary - is c inside the shape?
    console.log("    ", "only d - running test");
    const inside = isInside(c);
    if (inside) {
      console.log("    ", "Valid rectangle, area", getArea(a, b));
    }
    return inside;
  }

  // Either one of c or d is outside the shape and cannot be part of a valid rectangle
  console.log("   ", "Invalid\n");
  return false;
};

const findMaxAreaRectangleFor = (
  position: Position,
  positions: Position[],
  filterFunc: (a: Position, b: Position) => boolean
) => {
  return positions
    .filter((p) => filterFunc(p, position))
    .map((p) => getArea(p, position))
    .max();
};

const findLargestRectangleArea = (
  filterFunc: (a: Position, b: Position) => boolean
) => {
  let pc = [...positions];

  let maxArea = 0;
  for (let i = pc.length - 1; i >= 0; i--) {
    let largestArea = findMaxAreaRectangleFor(pc[i]!, pc, filterFunc);
    if (largestArea > maxArea) {
      maxArea = largestArea;
    }
    pc.slice(i, 0);
  }

  return maxArea;
};

const createLines = () => {
  let pc = [...positions];

  const findNext = (original: Position, x: number | null, y: number | null) => {
    if (x && y === null) {
      const other = pc.filter((pp) => pp !== original).find((p) => p.x === x);
      return other;
    }

    if (y && x === null) {
      const other = pc.filter((pp) => pp !== original).find((p) => p.y === y);
      return other;
    }

    return null;
  };
  let a = pc[pc.length - 1]!;
  for (let i = pc.length - 1; i >= 0; i--) {
    let findX = i % 2 == 0;
    let b = findNext(a, findX ? a.x : null, !findX ? a.y : null);
    if (b) {
      // LINE!
      lines.push({ a, b });
      a = b;
    }

    pc.slice(i, 1);
  }
};

const solveFunc = async (d: any) => {
  positions = (d.data as string[]).map((r) => {
    positionsSet.add(r.trim());
    const c = r.trim().split(",")!;
    return { x: c[0]!.toInt(), y: c[1]!.toInt() };
  });

  createLines();

  console.log(positions);
  console.log(lines);

  console.log("Part 1", findLargestRectangleArea(filterPt1));
  console.log("Part 2", findLargestRectangleArea(filterPt2));
};

const puzzle = new Puzzle(9, solveFunc, SourceType.STRING_ARRAY, true);
export default puzzle;
