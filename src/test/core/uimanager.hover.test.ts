import { describe, it, expect, vi } from 'vitest';
import { UIManager } from '../../core/uimanager';
import { Root } from '../../core/root';
import { Container } from '../../core/container';
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

describe('UIManager — hover', () => {
  it('1. MouseMove dentro de A', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseMove(15, 15);

    expect(ui.hoveredNode).toBe(A);
    expect(A.hovered).toBe(true);
    expect(B.hovered).toBe(false);
  });

  it('2. MouseEnter disparado ao mover de A para B', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const enterA = vi.fn();
    const leaveA = vi.fn();
    const enterB = vi.fn();
    const leaveB = vi.fn();
    A.onMouseEnter = enterA;
    A.onMouseLeave = leaveA;
    B.onMouseEnter = enterB;
    B.onMouseLeave = leaveB;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseMove(15, 15);
    expect(ui.hoveredNode).toBe(A);
    expect(enterA).toHaveBeenCalledTimes(1);
    expect(leaveA).toHaveBeenCalledTimes(0);

    ui.dispatchMouseMove(15, 65);

    expect(ui.hoveredNode).toBe(B);
    expect(leaveA).toHaveBeenCalledTimes(1);
    expect(enterB).toHaveBeenCalledTimes(1);
    expect(A.hovered).toBe(false);
    expect(B.hovered).toBe(true);
  });

  it('3. MouseLeave ao sair da área dos botões', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const leaveA = vi.fn();
    A.onMouseLeave = leaveA;

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseMove(15, 15);
    expect(ui.hoveredNode).toBe(A);

    ui.dispatchMouseMove(200, 200);

    expect(leaveA).toHaveBeenCalledTimes(1);
    expect(ui.hoveredNode).toBeNull();
    expect(A.hovered).toBe(false);
  });

  it('4. Mover para filho de container aninhado', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const panel = new Container({ x: 50, y: 50, width: 200, height: 200 });
    const button = new Widget({ x: 10, y: 10, width: 50, height: 30 });
    panel.addChild(button);
    root.addChild(panel);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    // (65, 65) absoluto → (15, 15) dentro do Panel → (5, 5) dentro do Button
    ui.dispatchMouseMove(65, 65);

    expect(ui.hoveredNode).toBe(button);
    expect(button.hovered).toBe(true);
    expect(panel.hovered).toBe(false);
  });

  it('5. Mover sobre área do Panel sem filho', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const panel = new Container({ x: 50, y: 50, width: 200, height: 200 });
    const button = new Widget({ x: 10, y: 10, width: 50, height: 30 });
    panel.addChild(button);
    root.addChild(panel);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    // (100, 100) absoluto → dentro do Panel, fora do Button (60..110)
    ui.dispatchMouseMove(100, 100);

    expect(ui.hoveredNode).toBe(panel);
    expect(panel.hovered).toBe(true);
  });

  it('6. Nó disabled não recebe hover', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    A.enabled = false;

    // Ponto dentro de A, mas A está disabled → hover deve cair fora
    ui.dispatchMouseMove(15, 15);

    expect(ui.hoveredNode).not.toBe(A);
    expect(A.hovered).toBe(false);
  });

  it('7. Nó invisible não recebe hover', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    const B = makeButton(10, 60, 100, 40);
    root.addChild(A);
    root.addChild(B);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    A.visible = false;

    ui.dispatchMouseMove(15, 15);

    expect(ui.hoveredNode).not.toBe(A);
    expect(A.hovered).toBe(false);
  });

  it('8. Cursor styles — pointer quando hoveredNode existe, default caso contrário', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    expect(canvas.style.cursor).toBe('default');

    ui.dispatchMouseMove(15, 15);
    expect(canvas.style.cursor).toBe('pointer');

    ui.dispatchMouseMove(200, 200);
    expect(canvas.style.cursor).toBe('default');
  });

  it('9. forgetNode limpa hoveredNode', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseMove(15, 15);
    expect(ui.hoveredNode).toBe(A);

    ui.forgetNode(A);

    expect(ui.hoveredNode).toBeNull();
  });
});

describe('UIManager — forgetNode expanded', () => {
  it('forgetNode com activeNode limpa activeNode', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.dispatchMouseDown(15, 15);
    expect(ui.activeNode).toBe(A);

    ui.forgetNode(A);
    expect(ui.activeNode).toBeNull();
  });

  it('forgetNode com draggingNode limpa draggingNode', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);
    ui.draggingNode = A;

    ui.forgetNode(A);
    expect(ui.draggingNode).toBeNull();
  });

  it('forgetNode com nó sem estado não lança erro', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const A = makeButton(10, 10, 100, 40);
    root.addChild(A);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    expect(() => ui.forgetNode(A)).not.toThrow();
  });

  it('forgetNode recursivo limpa filhos', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const parent = makeButton(10, 10, 200, 200);
    const child = makeButton(20, 20, 50, 50);
    root.addChild(parent);
    parent.addChild(child);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);

    ui.hoveredNode = parent;
    ui.activeNode = child;

    ui.forgetNode(parent);

    expect(ui.hoveredNode).toBeNull();
    expect(ui.activeNode).toBeNull();
  });

  it('removeChild chama forgetNode e limpa hoveredNode', () => {
    resetRedraw();
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const X = makeButton(10, 10, 100, 40);
    root.addChild(X);

    const canvas = createMockCanvas();
    const ui = new UIManager(root, canvas);
    root.setUIManagerRef(ui);

    ui.hoveredNode = X;

    root.removeChild(X);

    expect(ui.hoveredNode).toBeNull();
  });
});
