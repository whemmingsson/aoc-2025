export class Matrix<T> {
  private data: T[][];
  private rows: number;
  private cols: number;

  constructor(data: T[][]) {
    this.data = data;
    this.rows = data.length;
    this.cols = data[0]?.length || 0;
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

  print(): void {
    this.data.forEach((row) => {
      console.log(row.join(" "));
    });
  }
}
