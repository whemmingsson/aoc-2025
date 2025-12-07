import { Matrix } from "../matrix";
import { Puzzle, SourceType } from "../Puzzle";
import { Delimiters } from "../utils";

interface Position {
  r: number;
  c: number;
}

const solveFunc = async (d: any) => {
  const m = d.data as Matrix<string>;

  console.log(m);

  const findRollsToRemove = () => {
    const toRemove: Position[] = [];
    m.foreach((rI, cI) => {
      if (m.get(rI, cI) !== "@") return;
      const adjacent = m.getAdjacent(rI, cI).filter((m) => m.value === "@");

      if (adjacent.length < 4) {
        toRemove.push({ r: rI, c: cI });
      }
    });
    return toRemove;
  };

  const removeRolls = (toRemove: Position[]) => {
    toRemove.forEach((a) => {
      m.set(a.r, a.c, "x");
    });
    return toRemove.length;
  };

  let totalRollsRemoved = 0;
  let iter = 0;
  while (true) {
    let toRemove = findRollsToRemove();
    let removedCount = removeRolls(toRemove);

    console.log("Iteration:", iter + 1, "rolls removed:", removedCount);

    totalRollsRemoved += removedCount;
    if (removedCount === 0) {
      break;
    }

    iter++;
  }

  //m.print();
  console.log("");
  console.log("Part 2:", totalRollsRemoved);
};

const puzzle = new Puzzle(
  4,
  solveFunc,
  SourceType.STRING_MATRIX,
  false,
  Delimiters.EMPTY
);
export default puzzle;
