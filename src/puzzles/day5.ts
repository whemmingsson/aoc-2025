import { Puzzle, SourceType } from "../Puzzle";

interface Range {
  min: number;
  max: number;
  id?: string;
}

const getRangeLength = (r: Range) => {
  return r.max - r.min + 1;
};

const areDisjoint = (a: Range, b: Range) => {
  if (a.min > b.max) return true;
  if (b.min > a.max) return true;
  return false;
};

const allAreDisjoint = (ranges: Range[]) => {
  for (let i = 0; i < ranges.length - 1; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (!areDisjoint(ranges[i]!, ranges[j]!)) {
        return false;
      }
    }
  }

  return true;
};

const overlaps = (a: Range, b: Range) => {
  return !areDisjoint(a, b);
};

const areEqual = (a: Range, b: Range) => {
  return a.min === b.min && a.max === b.max;
};

const getRanges = (rows: String[]) => {
  return rows
    .filter((r) => r.indexOf("-") >= 0)
    .map((r) => {
      const p = r.split("-");
      return {
        min: Number.parseInt(p[0]!),
        max: Number.parseInt(p[1]!),
        id: crypto.randomUUID(),
      } as Range;
    });
};

const mergeRanges = (ranges: Range[]) => {
  const min = Math.min(...ranges.map((r) => r.min));
  const max = Math.max(...ranges.map((r) => r.max));
  return { min, max, id: crypto.randomUUID() } as Range;
};

const contains = (list: String[], value: String) => {
  if (list.find((r) => r === value)) return true;
  return false;
};

const reduceRanges = (ranges: Range[]): Range[] => {
  const toAdd: Range[] = []; // New ranges
  const toRemove: string[] = []; // Id's of ranges to remove
  for (let i = 0; i < ranges.length - 1; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      let firstRange = ranges[i]!;
      let secondRange = ranges[j]!;

      if (areEqual(firstRange, secondRange)) {
        toRemove.push(firstRange.id!);
        continue;
      }

      if (
        overlaps(firstRange, secondRange) &&
        !contains(toRemove, firstRange.id!) &&
        !contains(toRemove, secondRange.id!)
      ) {
        toAdd.push(mergeRanges([firstRange, secondRange]));
        toRemove.push(firstRange.id!);
        toRemove.push(secondRange.id!);
      }
    }
  }

  const rangesClone = [...ranges];

  // Add merged ranges
  toAdd.forEach((r) => {
    rangesClone.push(r);
  });

  // Remove duplicate ranges or ranges that have been merged
  toRemove.forEach((id) => {
    const rangeToRemove = rangesClone.find((r) => r.id === id);
    if (!rangeToRemove) {
      return;
    }
    rangesClone.splice(rangesClone.indexOf(rangeToRemove), 1);
  });

  return rangesClone;
};

const solveFunc = async (d: any) => {
  let ranges = getRanges(d.data as String[]);
  do {
    ranges = reduceRanges(ranges);
  } while (!allAreDisjoint(ranges));

  console.log(
    "Total fresh ingredients",
    ranges.map(getRangeLength).reduce((a, b) => a + b, 0)
  );
};

const puzzle = new Puzzle(5, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;

// Failed values (too high): 363097431633192
