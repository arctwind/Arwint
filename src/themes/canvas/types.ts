export interface ThemeCanvasEffect {
  draw: (ctx: CanvasRenderingContext2D, timestamp: number, canvas: HTMLCanvasElement) => void
  setup?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => (() => void) | void
  resize?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
}
