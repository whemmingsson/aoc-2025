import {
  getInputAsArrayOfStrings,
  getInputAsNumberArrays,
  getInputAsString,
} from "./fileUtils";
import { Matrix } from "./matrix";
import {
  buildMatrix,
  buildNumberMatrix,
  buildStringMatrix,
} from "./puzzleUtils";
import { Delimiters } from "./utils";

export enum SourceType {
  STRING_ARRAY,
  NUMBER_ARRAY,
  RAW,
  STRING_MATRIX,
  NUMBER_MATRIX,
}

// Type-safe data interfaces
interface StringArrayData {
  data: string[];
}

interface NumberArrayData {
  data: number[][];
}

interface RawData {
  data: string;
}

interface StringMatrixData {
  data: Matrix<any>;
}

interface NumberMatrixData {
  data: Matrix<number>;
}

// Type mapping for SourceType to Data type
type DataForSourceType<T extends SourceType> = T extends SourceType.STRING_ARRAY
  ? StringArrayData
  : T extends SourceType.NUMBER_ARRAY
  ? NumberArrayData
  : T extends SourceType.RAW
  ? RawData
  : T extends SourceType.STRING_MATRIX
  ? StringMatrixData
  : T extends SourceType.NUMBER_MATRIX
  ? NumberMatrixData
  : never;

const getData = async <T extends SourceType>(
  sourceType: T,
  fileName: string,
  useExample: boolean
): Promise<DataForSourceType<T>> => {
  switch (sourceType) {
    case SourceType.STRING_ARRAY:
      return {
        data: await getInputAsArrayOfStrings(fileName, useExample),
      } as DataForSourceType<T>;
    case SourceType.NUMBER_ARRAY:
      return {
        data: await getInputAsNumberArrays(
          fileName,
          Delimiters.SPACE,
          useExample
        ),
      } as DataForSourceType<T>;
    case SourceType.RAW:
      return {
        data: await getInputAsString(fileName, useExample),
      } as DataForSourceType<T>;
    case SourceType.STRING_MATRIX:
      return {
        data: await buildStringMatrix(fileName),
      } as DataForSourceType<T>;
    case SourceType.NUMBER_MATRIX:
      return {
        data: await buildNumberMatrix(fileName),
      } as DataForSourceType<T>;
    default:
      throw new Error(`Unsupported source type: ${sourceType}`);
  }
};

export class Puzzle<T extends SourceType> {
  day: number;
  fileName: string;
  useExample: boolean;
  sourceType: T;
  solver: (data: DataForSourceType<T>) => Promise<void>;

  constructor(
    day: number,
    solver: (data: DataForSourceType<T>) => Promise<void>,
    sourceType: T,
    useExample: boolean = false
  ) {
    this.day = day;
    this.fileName = `day${day}.txt`;
    this.useExample = useExample;
    this.sourceType = sourceType;
    this.solver = solver;
  }

  async solve(): Promise<void> {
    try {
      console.log(`--- Day ${this.day} ---`);
      const data = await getData(
        this.sourceType,
        this.fileName,
        this.useExample
      );
      console.log("Starting solver...\n");
      await this.solver(data);
      console.log("\nSolver finished...\n");
      console.log(`--- End of Day ${this.day} ---`);
    } catch (e) {
      console.log(e);
    }
  }
}
