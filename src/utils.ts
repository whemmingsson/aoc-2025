export enum Delimiters {
  COMMA = ",",
  SPACE = " ",
  EMPTY = "",
}

interface Group {
  label: any;
  elements: any[];
}

declare global {
  interface Array<T> {
    sum(): number;
    product(): number;
    min(): number;
    max(): number;
    groupBy(predicate: (e: T) => any): Group[];
  }

  interface String {
    toInt(): number;
  }
}

// Array prototype extensions
Array.prototype.sum = function () {
  return this.reduce((acc: number, val: number) => acc + val, 0);
};

Array.prototype.product = function () {
  return this.reduce((acc: number, val: number) => acc * val, 1);
};

Array.prototype.min = function () {
  return Math.min(...this);
};

Array.prototype.max = function () {
  return Math.max(...this);
};

Array.prototype.groupBy = function (keyFunc: (e: any) => any) {
  const map = new Map();
  for (const element of this) {
    const key = keyFunc(element);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(element);
  }
  return Array.from(map.entries()).map(([label, elements]) => ({
    label,
    elements,
  }));
};

//String prototype extensions
String.prototype.toInt = function () {
  return Number.parseInt(this as string);
};

// Utility functions

export const doWhile = (f: () => void, c: () => void) => {
  do {
    f();
  } while (c);
};

export const forN = (n: number, f: (i: number) => void) => {
  for (let i = 0; i < n; i++) {
    f(i);
  }
};
