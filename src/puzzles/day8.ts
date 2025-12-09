import { Puzzle, SourceType } from "../Puzzle";
import { Delimiters } from "../utils";

interface Box {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface Circuit {
  id: number;
  boxes: Box[];
}

interface Dist {
  distance: number;
  a: Box;
  b: Box;
}

const boxes: Box[] = [];
const circuits: Circuit[] = [];
const distanceMap: Map<String, number> = new Map();
const boxesMap: Map<number, Box> = new Map();
const distances: Dist[] = [];

const distance = (a: Box, b: Box) => {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
};

const makeKey = (a: Box, b: Box) => a.id + "_" + b.id;

const isBoxInCircuit = (box: Box) => {
  const foundCircuit = circuits.find((c) =>
    c.boxes.find((b) => b.id === box.id)
  );
  if (foundCircuit) return foundCircuit;
  return null;
};

const sortDistances = () => {
  for (const kvp of distanceMap) {
    const boxesIds = kvp[0].split("_").map((id) => id.toInt());
    let d = kvp[1];

    distances.push({
      a: boxesMap.get(boxesIds[0]!)!,
      b: boxesMap.get(boxesIds[1]!)!,
      distance: d,
    });
  }

  distances.sort((a, b) => a.distance - b.distance);
};

const connect = (a: Box, b: Box) => {
  let ac = isBoxInCircuit(a)!;
  let bc = isBoxInCircuit(b)!;

  if (ac?.id === bc?.id) {
    return;
  }

  bc.boxes.forEach((bb) => {
    ac.boxes.push(bb);
  });

  circuits.splice(circuits.indexOf(bc), 1);
};

const initializeCircuits = () => {
  boxes.forEach((b) => {
    circuits.push({ id: circuits.length, boxes: [b] });
  });
};

const sortCircuits = () => {
  circuits.sort((a, b) => b.boxes.length - a.boxes.length);
};

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  // Parse
  rows.forEach((r, i) => {
    let coords = r.trim().split(",");
    boxes.push({
      id: i,
      x: coords[0]!.toInt(),
      y: coords[1]!.toInt(),
      z: coords[2]!.toInt(),
    });
  });

  // Move each box to it's own circuit
  initializeCircuits();

  // Make a distance map
  for (let i = 0; i < boxes.length - 1; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      let key = makeKey(boxes[i]!, boxes[j]!);
      distanceMap.set(key, distance(boxes[i]!, boxes[j]!));
    }
  }

  // Make a boxes map
  boxes.forEach((b) => {
    boxesMap.set(b.id, b);
  });

  // Order the distances from shortest to longest
  sortDistances();

  let runs = 0;
  let xMult = 0;
  do {
    const { a, b } = distances[runs]!;
    console.log(runs, "Connecting boxes...");
    connect(a, b);
    runs++;
    if (circuits.length === 1) {
      xMult = a.x * b.x;
      break;
    }
  } while (true);

  // Part 1 logic
  //sortCircuits();
  //const maxCircuits = circuits.slice(0, 3);
  //console.log("Part 1", maxCircuits.map((c) => c.boxes.length).product());

  console.log("Part 2", xMult);
};

const puzzle = new Puzzle(8, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;
