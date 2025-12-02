import { promises as fs } from "fs";
import { join } from "path";

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

const getFileContentAsArray = async (path: string): Promise<string[]> => {
  const content = await readFile(path);
  return content.split("\r\n").filter((line) => line.length > 0);
};

const readFile = async (path: string): Promise<string> => {
  const exists = await fileExists(path);
  if (!exists) {
    console.error("File does not exist:", path);
    throw new Error(`File not found: ${path}`);
  }

  try {
    const content = await fs.readFile(path, "utf-8");
    console.log(
      "File",
      path,
      "read successfully, content length:",
      content.length
    );
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

export const makePath = (filename: string, useExample?: boolean): string => {
  if (useExample) {
    const parts = filename.split(".");
    const exampleFilename = `${parts[0]}.example.${parts.slice(1).join(".")}`;
    return join(process.cwd(), "input", exampleFilename);
  }
  return join(process.cwd(), "input", filename);
};

export const getInputAsString = async (
  filename: string,
  useExample?: boolean
): Promise<string> => {
  const path = makePath(filename, useExample);
  return readFile(path);
};

export const getInputAsArrayOfStrings = async (
  filename: string,
  useExample?: boolean
): Promise<string[]> => {
  const path = makePath(filename, useExample);
  return getFileContentAsArray(path);
};

export const getInputAsNumberArrays = async (
  filename: string,
  columnDelimiter: string = " ",
  useExample?: boolean
): Promise<number[][]> => {
  const content = await getInputAsArrayOfStrings(filename, useExample);
  return content.map((line) =>
    line.split(columnDelimiter).map((col) => {
      const num = Number.parseInt(col.trim());
      if (Number.isNaN(num)) {
        console.warn(
          `Warning: Unable to parse "${col}" as a number. Defaulting to 0.`
        );
        return 0;
      }
      return num;
    })
  );
};

export const getInputAsColumns = async <T = string>(
  filename: string,
  columnDelimiter: string = " ",
  mapFunc?: (value: string, rowIndex: number, colIndex: number) => T | string,
  useExample?: boolean
): Promise<(T | string)[][]> => {
  const content = await getInputAsArrayOfStrings(filename, useExample);
  let result: (T | string)[][] = [];
  content.forEach((line, lineIndex) => {
    const columns = line.split(columnDelimiter).map((col) => col.trim());
    for (let i = 0; i < columns.length; i++) {
      if (!result[i]) {
        result[i] = [];
      }
      if (!columns[i]) {
        console.warn(
          `Warning: Missing column ${i} in line "${line}" (index ${lineIndex}). Skipping this entry.`
        );
        continue;
      } else {
        const value: T | string = mapFunc
          ? mapFunc(columns[i]!, lineIndex, i)
          : columns[i]!;
        result[i]!.push(value);
      }
    }
  });
  return result;
};
