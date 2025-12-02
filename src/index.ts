const args = process.argv.slice(2);
const dayParam = args[0];

if (!dayParam || Number.isNaN(Number.parseInt(dayParam)))
  throw Error("Invalid day param");

async function main(): Promise<void> {
  try {
    const module = await import(`./puzzles/day${dayParam}.js`);
    await module.default.solve();
  } catch (e) {
    console.log("Could not find puzzle solver for day", dayParam);
    throw e;
  }
}

// Run the main function
await main();

// Make index a module
export {};
