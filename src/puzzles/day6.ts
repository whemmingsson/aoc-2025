import { Puzzle, SourceType } from "../Puzzle";

enum Operator {
  PLUS = "+",
  TIMES = "*",
  UNKNOWN = "U",
}

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

const getOperator = (v: string) => {
  if (v === "*") return Operator.TIMES;
  if (v === "+") return Operator.PLUS;

  return Operator.UNKNOWN;
};

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

const getColumn = (rows: String[], position: number) => {
  let columnValues = [];
  let row = 0;
  while (row < rows.length) {
    columnValues.push(rows[row]![position]!);
    row++;
  }
  return columnValues;
};

const getColumnOperand = (column: string[]): number => {
  return Number.parseInt(
    column
      .filter((v) => v.trim() !== "")
      .filter((v) => !isOperator(v))
      .join("")
  );
};

const isEmpty = (column: string[]) => column.every((v) => v.trim() === "");

const containsOperator = (column: string[]) =>
  isOperator(column[column.length - 1]!);

const parseByColumns = (rows: string[]) => {
  let currentProblem: Problem = { operands: [] };

  for (let i = rows[0]?.length! - 1; i >= 0; i--) {
    const column = getColumn(rows, i);

    if (isEmpty(column)) {
      currentProblem = { operands: [] };
      continue;
    }

    currentProblem.operands.push(getColumnOperand(column));

    if (containsOperator(column)) {
      problems.push({ ...currentProblem, operator: getColumnOperator(column) });
    }
  }
};

const clear = () => {
  problems = [];
  problemsMap.clear();
};

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  for (let i = 0; i < rows.length; i++) {
    parseRow(rows[i]!);
  }
  console.log(
    "Grant total (pt1)",
    problems.map(solveProblem).reduce((a, b) => a + b, 0)
  );

  clear();
  parseByColumns(rows);
  console.log(
    "Grant total (pt2)",
    problems.map(solveProblem).reduce((a, b) => a + b, 0)
  );
};

const puzzle = new Puzzle(6, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;
