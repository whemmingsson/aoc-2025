import { Puzzle, SourceType } from "../Puzzle";

const solvFunc = async (d: any) => {
  let dial = 50;
  let atZeroCount = 0;

  const moveDial = (direction: string, count: number) => {
    let zeroCount = 0;
    for (let i = 0; i < count; i++) {
      if (direction === "R") {
        dial += 1;
      } else {
        dial -= 1;
      }

      if (dial === 0 || dial === 100) {
        zeroCount++;
      }

      if (dial === 100) {
        dial = 0;
      } else if (dial === -1) {
        dial = 99;
      }
    }
    return zeroCount;
  };

  const regex = /(R|L)(\d+)/;
  for (const row of d.data) {
    const instruction = regex.exec(row);
    if (!instruction) continue;
    atZeroCount += moveDial(
      instruction[1] ?? "",
      Number.parseInt(instruction[2] ?? "")
    );
  }

  console.log("Answer", atZeroCount);
};

const puzzle = new Puzzle(1, solvFunc, SourceType.STRING_ARRAY);
export default puzzle;
