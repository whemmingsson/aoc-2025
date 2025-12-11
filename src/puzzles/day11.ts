import { Puzzle, SourceType } from "../Puzzle";

class Node {
  label: string;
  adjacent: Node[];
  /**
   *
   */
  constructor(label: string) {
    this.label = label;
    this.adjacent = [];
  }

  getLabel() {
    return this.label;
  }

  add(n: Node) {
    this.adjacent.push(n);
  }

  getAdjacent() {
    return this.adjacent;
  }
}

const nodes: Node[] = [];
const nodeMap: Map<string, Node> = new Map();

const getOrCreate = (label: string): Node => {
  if (nodeMap.has(label)) return nodeMap.get(label)!;

  let n = new Node(label);
  nodeMap.set(label, n);

  return n;
};

let source: Node | null = null;
let target: Node | null = null;

const dfs = (
  source: Node,
  target: Node,
  path: string[],
  allPaths: string[][]
) => {
  path.push(source.getLabel());

  if (source.getLabel() === target.getLabel()) {
    allPaths.push([...path]);
  }

  source.getAdjacent().forEach((a) => {
    dfs(a, target, path, allPaths);
  });

  path.pop();
};

const findAllPaths = (sourceLabel: string, targetLabel: string) => {
  let path: string[] = [];
  let allPaths: string[][] = [];

  dfs(getOrCreate(sourceLabel), getOrCreate(targetLabel), path, allPaths);
  console.log("you -> out", allPaths.length);
};

const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  rows.forEach((r) => {
    const nodesRaw = r.trim().split(":");
    const nodeLabel = nodesRaw[0]!.trim();
    let node = getOrCreate(nodeLabel);
    let adjacent = nodesRaw[1]!
      .split(" ")
      .map((n) => n.trim())
      .filter((n) => n !== "")
      .map(getOrCreate);

    adjacent.forEach((a) => node.add(a));
    nodes.push(node);
  });

  source = nodeMap.get("svr")!;
  target = nodeMap.get("fft")!;

  findAllPaths("you", "out");
};

const puzzle = new Puzzle(11, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;
