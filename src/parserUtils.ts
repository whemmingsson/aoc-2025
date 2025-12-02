export const toNumbers = (
  lines: string[],
  delimiter: string = ","
): number[][] => {
  return lines.map((line, lineIndex) =>
    line.split(delimiter).map((value) => {
      const num = Number.parseInt(value.trim());
      if (Number.isNaN(num)) {
        console.warn(
          `Warning: Unable to parse "${value}" on line ${
            lineIndex + 1
          } as a number. Defaulting to 0.`
        );
      }
      return Number.isNaN(num) ? 0 : num;
    })
  );
};
