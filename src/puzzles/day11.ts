import { Puzzle, SourceType } from "../Puzzle";
import * as fs from "fs";

class Node {
  label: string;
  adjacent: Node[];
  visitCount: number;
  /**
   *
   */
  constructor(label: string) {
    this.label = label;
    this.adjacent = [];
    this.visitCount = 0;
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

  visit() {
    this.visitCount++;
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

const dfsCache: Map<string, string[]> = new Map();
const key = (a: Node, b: Node) => {
  return a.getLabel() + "_" + b.getLabel();
};

const getOrCreatePathCache = (source: Node, target: Node): string[] => {
  const k = key(source, target);
  if (dfsCache.has(k)) return dfsCache.get(k)!;

  let path: string[] = [];
  dfsCache.set(k, path);
  return path;
};

const isInCache = (source: Node, target: Node) => {
  const k = key(source, target);
  return dfsCache.has(k);
};

let recursiveCalls = 0;
const dfs = (
  source: Node,
  target: Node,
  path: string[],
  allPaths: string[][],
  level: number = 0
) => {
  //if(source.visitCount >= 1) return;

  path.push(source.getLabel());
  source.visit();

  if (source.getLabel() === target.getLabel()) {
    allPaths.push([...path]);
  }

  source.getAdjacent().forEach((a) => {
    recursiveCalls++;
    dfs(a, target, path, allPaths, level + 1);
  });

  path.pop();
};

const visitAll = (node: Node) => {
  if (!node) return;
  node.visit();

  node.getAdjacent().forEach((nn) => {
    visitAll(nn);
  });
};

const filterPaths = (paths: string[]) => {
  return true;
  //return paths.indexOf("dac") >= 0 && paths.indexOf("fft") >= 0;
};

const findAllPaths = (sourceLabel: string, targetLabel: string) => {
  let path: string[] = [];
  let allPaths: string[][] = [];

  dfs(getOrCreate(sourceLabel), getOrCreate(targetLabel), path, allPaths);
  console.log(
    sourceLabel,
    "->",
    targetLabel,
    allPaths.filter((path) => filterPaths(path)).length
  );
  //allPaths.forEach((p) => console.log(p.join("->")));
};

const createGraphDOT = () => {
  let path = "out.dot";
  let dotContent = "digraph DependencyGraph {\n";
  dotContent += "  rankdir=LR;\n";
  dotContent += "  node [shape=box, style=rounded];\n\n";

  dotContent += "\n";

  nodes.forEach((node) => {
    if (node.label === "dac") {
      dotContent +=
        node.label + ' [fillcolor = "green", style = filled]' + "\n";
    } else if (node.label === "fft") {
      dotContent +=
        node.label + ' [fillcolor = "green", style = filled]' + "\n";
    } else if (node.label === "you") {
      dotContent +=
        node.label + ' [fillcolor = "yellow", style = filled]' + "\n";
    } else {
      dotContent += node.label + "\n";
    }
  });

  nodes.forEach((node) => {
    dotContent +=
      node.label +
      ` -> {${node
        .getAdjacent()
        .map((n) => n.label)
        .join(" ")}}\n`;
  });

  dotContent += "}\n";

  // Write to file
  fs.writeFileSync(path, dotContent);
  console.log(`\nGraphviz DOT file created: ${path}`);
  console.log("To generate a visual graph, run:");
  console.log(`  dot -Tpng ${path} -o dependency-graph.png`);
  console.log(`  dot -Tsvg ${path} -o dependency-graph.svg`);
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

  createGraphDOT();
  //return;

  source = nodeMap.get("svr")!;
  target = nodeMap.get("out")!;

  //findAllPaths("you", "out");
  visitAll(source);

  const dac = nodeMap.get("dac")!;
  const fft = nodeMap.get("fft")!;
  const out = nodeMap.get("out")!;
  console.log(dac);
  console.log(fft);
  console.log(out);
  console.log("Recursions:", recursiveCalls);
};

const puzzle = new Puzzle(11, solveFunc, SourceType.STRING_ARRAY, false);
export default puzzle;

// svr -> fft 74304
