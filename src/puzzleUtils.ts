import { getInputAsArrayOfStrings } from "./fileUtils";
import { Matrix } from "./matrix";
import { Delimiters } from "./utils";

export const executeOnLineVoid = (
  lines: string[],
  executorFunc: (line: string, index: number) => void
): void => {
  lines.forEach((line, index) => {
    executorFunc(line, index);
  });
};

export const executeOnLine = <T>(
  lines: string[],
  executorFunc: (line: string, index: number) => T
): T[] => {
  return lines.map((line, index) => executorFunc(line, index));
};

export const buildMatrix = async <T>(
  fileName: string,
  columnDelimiter: string = Delimiters.SPACE,
  lineParser?: (line: string, rowIndex: number, colIndex: number) => T,
  useExample?: boolean
): Promise<Matrix<T>> => {
  const content = await getInputAsArrayOfStrings(fileName, useExample);
  const asTypedContent: T[][] = [];

  if (lineParser) {
    content.forEach((line, rowIndex) => {
      const cols = line.split(columnDelimiter);
      const typedRow: T[] = cols.map((col, colIndex) =>
        lineParser(col, rowIndex, colIndex)
      );
      asTypedContent.push(typedRow);
    });
  }

  return new Matrix(asTypedContent);
};

export const buildNumberMatrix = async (
  fileName: string,
  columnDelimiter: string = Delimiters.SPACE
): Promise<Matrix<number>> => {
  return buildMatrix<number>(
    fileName,
    columnDelimiter,
    (value) => Number.parseInt(value),
    false
  );
};

export const buildStringMatrix = async (
  fileName: string,
  columnDelimiter: string = Delimiters.SPACE
): Promise<Matrix<string>> => {
  return buildMatrix<string>(
    fileName,
    columnDelimiter,
    (value) => value,
    false
  );
};
