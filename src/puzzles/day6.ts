import { Puzzle, SourceType } from "../Puzzle";
import { forN } from "../utils";

enum Operator {
  PLUS = "+",
  TIMES = "*",
  UNKNOWN = "U",
}

const opMap = new Map<string, Operator>();
opMap.set("*", Operator.TIMES);
opMap.set("+", Operator.PLUS);

interface Problem {
  operands: number[];
  operator?: Operator;
}

let problems: Problem[] = [];
const problemsMap: Map<Number, Problem> = new Map();

const getOrCreateProblem = (id: number) => {
  if (problemsMap.has(id)) {
    return problemsMap.get(id)!;
  }

  const p: Problem = { operands: [], operator: Operator.UNKNOWN };
  problems.push(p);
  problemsMap.set(id, p);
  return p;
};

const solveProblem = (p: Problem) => {
  if (p.operator === Operator.PLUS) {
    return p.operands.reduce((a, b) => a + b, 0);
  }
  if (p.operator === Operator.TIMES) {
    return p.operands.reduce((a, b) => a * b, 1);
  }

  return 0;
};

const isOperator = (v: string) => v === "*" || v === "+";
const getOperator = (v: string) => opMap.get(v) ?? Operator.UNKNOWN;
const getColumnOperator = (column: string[]) =>
  getOperator(column[column.length - 1]!);

const parseRow = (row: string) => {
  const parts = row
    .split(" ")
    .map((p) => p.trim())
    .filter((p) => p !== "");

  for (let i = 0; i < parts.length; i++) {
    let problem = getOrCreateProblem(i);
    let v = parts[i]!;
    if (isOperator(v)) {
      problem.operator = getOperator(v);
    } else {
      problem.operands.push(Number.parseInt(v!));
    }
  }
};

const getColumn = (rows: String[], pos: number) => {
  let columnValues: string[] = [];
  forN(rows.length, (i) => columnValues.push(rows[i]![pos]!));
  return columnValues;
};

const getColumnOperand = (column: string[]): number =>
  column
    .filter((v) => v.trim() !== "" && !isOperator(v))
    .join("")
    .toInt();

const isEmpty = (column: string[]) => column.every((v) => v.trim() === "");

const containsOperator = (column: string[]) =>
  isOperator(column[column.length - 1]!);

const parseByColumns = (rows: string[]) => {
  let result: Problem[] = [];
  let problem: Problem = { operands: [] };

  for (let i = rows[0]?.length! - 1; i >= 0; i--) {
    const column = getColumn(rows, i);

    if (!isEmpty(column)) {
      problem.operands.push(getColumnOperand(column));
    }

    if (containsOperator(column)) {
      problem.operator = getColumnOperator(column);
      result.push(problem);
      problem = { operands: [] };
    }
  }

  return result;
};

const clear = () => {
  problems = [];
  problemsMap.clear();
};

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  forN(rows.length, (i) => parseRow(rows[i]!));

  console.log("(pt1)", problems.map(solveProblem).sum());

  clear();
  console.log("(pt2)", parseByColumns(rows).map(solveProblem).sum());
};

const puzzle = new Puzzle(6, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;
