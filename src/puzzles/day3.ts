import { Puzzle, SourceType } from "../Puzzle";

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  const findMaxJoltageP2 = (pack: string) => {
    const BATTERY_SEQUENCE_LENGTH = 12;

    let batteriesOn = "";
    let prevIndex = -1;
    for (let i = 0; i < BATTERY_SEQUENCE_LENGTH; i++) {
      let bestJoltage = 0;
      let bestBatteryIndex = -1;
      for (let b = 0; b < pack.length; b++) {
        const joltage = parseInt(pack[b]!);

        if (
          joltage > bestJoltage &&
          b > prevIndex &&
          b + BATTERY_SEQUENCE_LENGTH - 1 - batteriesOn.length < pack.length
        ) {
          bestJoltage = joltage;
          bestBatteryIndex = b;
        }
      }
      batteriesOn += pack[bestBatteryIndex];
      prevIndex = bestBatteryIndex;
    }

    return parseInt(batteriesOn);
  };

  const findMaxJoltage = (row: string) => {
    let maxJoltage = 0;

    for (let i = 0; i < row.length - 1; i++) {
      for (let j = i + 1; j < row.length; j++) {
        if (i === j) continue;

        const battery = row[i]! + row[j]!;
        const batteryValue = parseInt(battery);
        if (batteryValue > maxJoltage) {
          maxJoltage = batteryValue;
        }
      }
    }

    return maxJoltage;
  };

  let sum = rows.map((r) => findMaxJoltageP2(r)).reduce((a, b) => a + b, 0);
  console.log(sum);
};

const puzzle = new Puzzle(3, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;
