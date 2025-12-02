import { Puzzle, SourceType } from "../Puzzle";

interface Range {
  start: number;
  end: number;
}

const solveFunc = async (d: any) => {
  const isInvalidP2 = (i: number) => {
    const numberStr = i.toString();

    if (numberStr.length === 1) {
      return false;
    }

    for (let groupSize = 1; groupSize < numberStr.length / 2 + 1; groupSize++) {
      let group = numberStr.substring(0, groupSize);
      let index = groupSize;
      let matchCount = 0;
      while (index < numberStr.length) {
        if (numberStr.substring(index, index + groupSize) == group) {
          matchCount++;
        }
        index += groupSize;
      }

      if (matchCount === numberStr.length / groupSize - 1) {
        return true;
      }
    }
    return false;
  };

  const isInvalid = (i: number) => {
    let iS = i.toString();
    let l = iS.length;
    if (l % 2 !== 0) {
      // Cannot be correct
      return false;
    }
    let numLen = l / 2;
    let isInvalid = true;
    for (let j = 0; j < numLen; j++) {
      if (iS[j] !== iS[j + numLen]) {
        isInvalid = false;
        break;
      }
    }
    if (isInvalid) {
      console.log("  Invalid:", i);
      return true;
    }
    return false;
  };

  const countInvalidIds = (range: Range) => {
    // Bruteforce the hell out of this
    let sum = 0;
    for (let i = range.start; i <= range.end; i++) {
      if (isInvalidP2(i)) {
        console.log("Invalid:", i);
        sum += i;
      }
    }
    return sum;
  };

  const ranges = d.data.split(",").map((r: string) => {
    const [start, end] = r.split("-").map((n) => Number.parseInt(n));
    return { start: start!, end: end! };
  });

  let totalSum = 0;
  ranges.forEach((range: Range) => {
    const sum = countInvalidIds(range);
    totalSum += sum;
  });

  console.log("Part 2:", totalSum);
};

const puzzle = new Puzzle(2, solveFunc, SourceType.RAW);
export default puzzle;
