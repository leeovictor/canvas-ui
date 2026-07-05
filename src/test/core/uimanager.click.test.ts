import { describe, it, expect, vi } from 'vitest';
import { UIManager } from '../../core/uimanager';
import { Root } from '../../core/root';
import { Widget } from '../../core/widget';
import { resetRedraw } from '../../core/eventloop';

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

function makeButton(x: number, y: number, w: number, h: number): Widget {
  return new Widget({ x, y, width: w, height: h });
}

describe('UIManager — click', () => {
  it('1. mousedown + mouseup no mesmo nó — onClick chamado', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const onClickA = vi.fn();
    A.onClick = onClickA;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    expect(ui.activeNode).toBe(A);
    expect(A.pressed).toBe(true);

    ui.dispatchMouseUp(15, 15);
    expect(onClickA).toHaveBeenCalledTimes(1);
    expect(A.pressed).toBe(false);
    expect(ui.activeNode).toBeNull();
  });

  it('2. mousedown + mouseup em nós diferentes — onClick não chamado', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const onClickA = vi.fn();
    A.onClick = onClickA;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    expect(ui.activeNode).toBe(A);
    expect(A.pressed).toBe(true);

    ui.dispatchMouseUp(15, 65);
    expect(onClickA).not.toHaveBeenCalled();
    expect(A.pressed).toBe(false);
    expect(ui.activeNode).toBeNull();
  });

  it('3. mousedown + mouseup fora — onClick não chamado', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const onClickA = vi.fn();
    A.onClick = onClickA;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    expect(ui.activeNode).toBe(A);

    ui.dispatchMouseUp(200, 200);
    expect(onClickA).not.toHaveBeenCalled();
    expect(A.pressed).toBe(false);
    expect(ui.activeNode).toBeNull();
  });

  it('4. Clique em nó disabled — activeNode permanece null', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);
    A.enabled = false;

    const onClickA = vi.fn();
    A.onClick = onClickA;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    expect(ui.activeNode).toBeNull();
    expect(A.pressed).toBe(false);
  });

  it('5. Dois cliques em sequência — ambos onClick chamados', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const onClickA = vi.fn();
    const onClickB = vi.fn();
    A.onClick = onClickA;
    B.onClick = onClickB;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    ui.dispatchMouseUp(15, 15);
    expect(onClickA).toHaveBeenCalledTimes(1);
    expect(A.pressed).toBe(false);
    expect(ui.activeNode).toBeNull();

    ui.dispatchMouseDown(15, 65);
    ui.dispatchMouseUp(15, 65);
    expect(onClickB).toHaveBeenCalledTimes(1);
    expect(B.pressed).toBe(false);
    expect(ui.activeNode).toBeNull();
  });

  it('6. Regra de hover + press — pressed tem prioridade visual', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseMove(15, 15);
    expect(A.hovered).toBe(true);

    ui.dispatchMouseDown(15, 15);
    expect(A.pressed).toBe(true);
    expect(A.hovered).toBe(true);

    // pressed true → pressed tem prioridade visual sobre hover
    // (testado visualmente via button.test.ts)
    ui.dispatchMouseUp(15, 15);
    expect(A.pressed).toBe(false);
  });
});
