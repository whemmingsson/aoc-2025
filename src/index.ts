import { Puzzle, SourceType } from "./Puzzle";

async function main(): Promise<void> {
  const p = new Puzzle(1, false);
  await p.run(SourceType.STRING_ARRAY, async (d) => {
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
  });
}

// Run the main function
main()
  .then(() => {
    console.log("Main function completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Application error:", error);
    process.exit(1);
  });
