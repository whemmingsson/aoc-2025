import { get } from "http";
import { Puzzle, SourceType } from "../Puzzle";

const xor = (a: number, b: number) => {
  return a ^ b;
};

class LampArray {
  state: number;
  id: number;
  targetState: number;
  numberOfLamps: number;
  constructor(machineId: number, targetState: string) {
    this.numberOfLamps = targetState.length;
    this.id = machineId;
    this.state = 0;
    this.targetState = bitStringToNumber(createBitString(targetState));
  }

  display() {
    console.log(this.id, this.state);
  }

  getDisplayText() {
    const bitStr = this.state.toString(2).padStart(this.numberOfLamps, "0");
    return bitStr.replaceAll("0", ".").replaceAll("1", "#");
  }

  isDone() {
    return this.state === this.targetState;
  }

  onButtonPress(config: number) {
    this.state = xor(this.state, config);
  }
}

class Button {
  lamps: number;
  machineId: number;
  constructor(machineId: number, lamps: number) {
    this.machineId = machineId;
    this.lamps = lamps;
  }

  press() {
    if (!machineMap.has(this.machineId)) {
      console.log("Unable to find machine with id", this.machineId);
    }

    const machine = machineMap.get(this.machineId);
    machine?.onButtonPress(this.lamps);
  }
}

class Machine {
  lampArray: LampArray;
  buttons: Button[];
  id: number;
  constructor(id: number, lampArray: LampArray, buttons: Button[]) {
    this.id = id;
    this.lampArray = lampArray;
    this.buttons = buttons;
  }

  display() {
    this.lampArray.display();
  }

  solve() {
    console.log("TODO");
  }

  onButtonPress(config: number) {
    this.lampArray.onButtonPress(config);
  }

  print() {
    console.log("Machine:", this.id);
    console.log("Lamp state:", this.lampArray.getDisplayText());
  }

  getButtons() {
    return this.buttons;
  }
}

interface IButton {
  lamps: number[];
}

interface ILampArray {
  target: string;
}

interface IMachine {
  lampArray: ILampArray;
  buttons: IButton[];
}

const buildButton = (raw: string): IButton => {
  return {
    lamps: raw
      .replace("(", "")
      .replace(")", "")
      .split(",")
      .map((r) => r.toInt()),
  };
};

const buildLampArray = (raw: string): ILampArray => {
  return {
    target: raw.replace("[", "").replace("]", ""),
  };
};

const bitStringToNumber = (bitString: string) => {
  return Number.parseInt(bitString, 2);
};

const createBitString = (config: string) => {
  return config.replaceAll(".", "0").replaceAll("#", "1");
};

const buttonRegex = /\([\d,]+\)/g;
const lampRegex = /(\[[.#]+\])/;

// Raw structures
const machinesRaw: IMachine[] = [];

// Class structures
const machines: Machine[] = [];
const machineMap: Map<number, Machine> = new Map();
const solveFunc = async (d: any) => {
  const rows = d.data as string[];

  rows.forEach((row) => {
    const lamp = lampRegex.exec(row)![0];
    const buttonsStr = [...row.matchAll(buttonRegex)].map((r) => r[0]);
    const lampArray = buildLampArray(lamp);
    const buttons = buttonsStr.map((b) => buildButton(b));

    machinesRaw.push({ lampArray, buttons });
  });

  machinesRaw.forEach((m, i) => {
    const la = new LampArray(i, m.lampArray.target);
    const btns = m.buttons.map((b) => {
      let bitStrArr = "0".repeat(m.lampArray.target.length).split("");
      b.lamps.forEach((l) => (bitStrArr[l] = "1"));
      return new Button(i, bitStringToNumber(bitStrArr.join("")));
    });
    const machine = new Machine(i, la, btns);
    machines.push(machine);
    machineMap.set(i, machine);
  });

  // Demo
  let machine = machines[0]!;
  let buttons = machine.getButtons();

  buttons[buttons.length - 1]!.press();
  buttons[buttons.length - 2]!.press();

  machine.print();
};

const puzzle = new Puzzle(10, solveFunc, SourceType.STRING_ARRAY, true);
export default puzzle;
