"use strict";
var AOC = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browser.ts
  var browser_exports = {};
  __export(browser_exports, {
    Delimiters: () => Delimiters,
    Matrix: () => Matrix,
    buildMatrix: () => buildMatrix,
    buildNumberMatrix: () => buildNumberMatrix,
    buildStringMatrix: () => buildStringMatrix,
    executeOnLine: () => executeOnLine,
    executeOnLineVoid: () => executeOnLineVoid
  });

  // src/matrix.ts
  var Matrix = class {
    data;
    rows;
    cols;
    constructor(data) {
      this.data = data;
      this.rows = data.length;
      this.cols = data[0]?.length || 0;
    }
    setValue(row, col, value) {
      this.data[row][col] = value;
    }
    getRow(index) {
      return this.data[index];
    }
    getColumn(index) {
      if (index < 0 || index >= this.cols) return void 0;
      return this.data.map((row) => row[index]);
    }
    getData() {
      return this.data;
    }
    getDimensions() {
      return { rows: this.rows, cols: this.cols };
    }
    getElement(row, col) {
      if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
        return void 0;
      }
      return this.data[row]?.[col];
    }
    getAdjacent(row, col) {
      let adjacent = [];
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          let r = row + i;
          let c = col + j;
          if (c === col && r === row) continue;
          const e = this.getElement(r, c);
          adjacent.push({ value: e ?? "", row: r, col: c });
        }
      }
      return adjacent;
    }
    foreach(func) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          func(r, c, this.getElement(r, c));
        }
      }
    }
    print() {
      this.data.forEach((row) => {
        console.log(row.join(" "));
      });
    }
  };

  // src/utils.ts
  var Delimiters = /* @__PURE__ */ ((Delimiters2) => {
    Delimiters2["COMMA"] = ",";
    Delimiters2["SPACE"] = " ";
    Delimiters2["EMPTY"] = "";
    return Delimiters2;
  })(Delimiters || {});

  // src/puzzleUtils.browser.ts
  var executeOnLineVoid = (lines, executorFunc) => {
    lines.forEach((line, index) => {
      executorFunc(line, index);
    });
  };
  var executeOnLine = (lines, executorFunc) => {
    return lines.map((line, index) => executorFunc(line, index));
  };
  var buildMatrix = async (rawContent, columnDelimiter = " " /* SPACE */, lineParser) => {
    const content = rawContent.split("\n");
    const asTypedContent = [];
    if (lineParser) {
      content.forEach((line, rowIndex) => {
        const cols = line.split(columnDelimiter);
        const typedRow = cols.map(
          (col, colIndex) => lineParser(col, rowIndex, colIndex)
        );
        asTypedContent.push(typedRow);
      });
    }
    return new Matrix(asTypedContent);
  };
  var buildNumberMatrix = async (rawContent, columnDelimiter = " " /* SPACE */) => {
    return buildMatrix(
      rawContent,
      columnDelimiter,
      (value) => Number.parseInt(value)
    );
  };
  var buildStringMatrix = async (rawContent, columnDelimiter = " " /* SPACE */) => {
    return buildMatrix(rawContent, columnDelimiter, (value) => value);
  };
  return __toCommonJS(browser_exports);
})();
