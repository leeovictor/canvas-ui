import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { UIManager } from '../../core/uimanager';
import { Root } from '../../core/root';
import { Slider } from '../../widgets/slider';
import { resetRedraw } from '../../core/eventloop';

beforeAll(() => {
  (globalThis as any).window = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
});

afterAll(() => {
  delete (globalThis as any).window;
});

function createMockCanvas(): HTMLCanvasElement {
  return {
    width: 800,
    height: 600,
    style: { cursor: 'default' } as CSSStyleDeclaration,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as HTMLCanvasElement;
}

describe('UIManager — drag', () => {
  const RADIUS = 10;
  const HANDLE_W = RADIUS * 2;
  const W = 200;
  const H = 30;
  const SLIDER_X = 10;
  const SLIDER_Y = 10;

  function makeSlider(value = 0.5): Slider {
    return new Slider({ x: SLIDER_X, y: SLIDER_Y, width: W, height: H, value });
  }

  function makeUI(slider: Slider): { ui: UIManager; root: Root; canvas: HTMLCanvasElement } {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    root.addChild(slider);
    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);
    return { ui, root, canvas };
  }

  function handleCenter(slider: Slider): { absX: number; absY: number } {
    return {
      absX: slider.handleX + SLIDER_X,
      absY: H / 2 + SLIDER_Y,
    };
  }

  it('1. mousedown no handle inicia drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseDown(absX, absY);

    expect(ui.draggingNode).toBe(slider);
    expect(ui.activeNode).toBe(slider);
    expect(slider.pressed).toBe(true);
  });

  it('2. mousemove durante drag atualiza valor', () => {
    const slider = makeSlider(0.5);
    const onChange = vi.fn();
    slider.onChange = onChange;
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseDown(absX, absY);

    const trackWidth = W - HANDLE_W;
    const targetLocalX = 40;
    const targetAbsX = targetLocalX + SLIDER_X;
    ui.dispatchMouseMove(targetAbsX, absY);

    const expectedValue = (targetLocalX - RADIUS) / trackWidth;
    expect(slider.value).toBeCloseTo(expectedValue, 10);
    expect(onChange).toHaveBeenCalled();
  });

  it('3. mouseup encerra drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseDown(absX, absY);
    expect(ui.draggingNode).toBe(slider);

    ui.dispatchMouseUp(absX, absY);
    expect(ui.draggingNode).toBeNull();
    expect(slider.pressed).toBe(false);
  });

  it('4. mousemove fora do canvas durante drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseDown(absX, absY);
    expect(slider.value).toBeCloseTo(0.5, 10);

    ui.dispatchMouseMove(-100, -100);

    expect(slider.value).toBe(0);
    expect(ui.draggingNode).toBe(slider);
  });

  it('5. mouseup fora do canvas encerra drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseDown(absX, absY);
    expect(ui.draggingNode).toBe(slider);

    ui.dispatchMouseUp(-100, -100);
    expect(ui.draggingNode).toBeNull();
    expect(slider.pressed).toBe(false);
  });

  it('6. mousedown no track (fora do handle) não inicia drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);

    const trackAbsX = SLIDER_X + 5;
    const trackAbsY = SLIDER_Y + H / 2;
    ui.dispatchMouseDown(trackAbsX, trackAbsY);

    expect(ui.draggingNode).toBeNull();
  });

  it('7. Hover não interfere durante drag', () => {
    const slider = makeSlider(0.5);
    const { ui } = makeUI(slider);
    const { absX, absY } = handleCenter(slider);

    ui.dispatchMouseMove(SLIDER_X + 5, SLIDER_Y + 5);
    const hoverBefore = ui.hoveredNode;

    ui.dispatchMouseDown(absX, absY);

    ui.dispatchMouseMove(absX + 10, absY);

    expect(ui.hoveredNode).toBe(hoverBefore);
  });
});
