export enum Delimiters {
  COMMA = ",",
  SPACE = " ",
  EMPTY = "",
}

declare global {
  interface Array<T> {
    sum(): number;
    product(): number;
    min(): number;
    max(): number;
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
