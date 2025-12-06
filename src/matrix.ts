interface Meta<T> {
  row: number;
  col: number;
  value: string | NonNullable<T>;
}

export class Matrix<T> {
  private data: T[][];
  private rows: number;
  private cols: number;

  constructor(data: T[][]) {
    this.data = data;
    this.rows = data.length;
    this.cols = data[0]?.length || 0;
  }

  setValue(row: number, col: number, value: T) {
    this.data[row]![col] = value;
  }

  getRow(index: number): T[] | undefined {
    return this.data[index];
  }

  getColumn(index: number): T[] | undefined {
    if (index < 0 || index >= this.cols) return undefined;
    return this.data.map((row) => row[index]!);
  }

  getData(): T[][] {
    return this.data;
  }

  getDimensions(): { rows: number; cols: number } {
    return { rows: this.rows, cols: this.cols };
  }

  getElement(row: number, col: number): T | undefined {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return undefined;
    }
    return this.data[row]?.[col];
  }

  getAdjacent(row: number, col: number): Meta<T>[] {
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

  foreach(func: (rI: number, cI: number, v?: T) => void) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        func(r, c, this.getElement(r, c));
      }
    }
  }

  print(): void {
    this.data.forEach((row) => {
      console.log(row.join(" "));
    });
  }
}
