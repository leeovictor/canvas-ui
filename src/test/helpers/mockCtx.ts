export interface MockCall {
  method: string;
  args: unknown[];
}

export class MockCtx {
  calls: MockCall[] = [];
  private _fillStyle: string = '#000';
  private _strokeStyle: string = '#000';

  get fillStyle(): string {
    return this._fillStyle;
  }

  set fillStyle(value: string) {
    this._fillStyle = value;
    this.calls.push({ method: 'setFillStyle', args: [value] });
  }

  get strokeStyle(): string {
    return this._strokeStyle;
  }

  set strokeStyle(value: string) {
    this._strokeStyle = value;
    this.calls.push({ method: 'setStrokeStyle', args: [value] });
  }
  font: string = '12px sans-serif';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  canvas: HTMLCanvasElement = { width: 800, height: 600 } as HTMLCanvasElement;

  save(): void {
    this.calls.push({ method: 'save', args: [] });
  }

  restore(): void {
    this.calls.push({ method: 'restore', args: [] });
  }

  translate(x: number, y: number): void {
    this.calls.push({ method: 'translate', args: [x, y] });
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.calls.push({ method: 'fillRect', args: [x, y, w, h] });
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.calls.push({ method: 'strokeRect', args: [x, y, w, h] });
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.calls.push({ method: 'clearRect', args: [x, y, w, h] });
  }

  fillText(text: string, x: number, y: number): void {
    this.calls.push({ method: 'fillText', args: [text, x, y] });
  }

  measureText(text: string): TextMetrics {
    return { width: text.length * 8 } as TextMetrics;
  }

  beginPath(): void {
    this.calls.push({ method: 'beginPath', args: [] });
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
    this.calls.push({ method: 'arc', args: [x, y, radius, startAngle, endAngle] });
  }

  fill(): void {
    this.calls.push({ method: 'fill', args: [] });
  }

  stroke(): void {
    this.calls.push({ method: 'stroke', args: [] });
  }

  clear(): void {
    this.calls = [];
  }
}
