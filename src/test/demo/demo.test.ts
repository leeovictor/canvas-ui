import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createDemo } from '../../demo/demo';
import { Panel } from '../../widgets/panel';
import { Button } from '../../widgets/button';
import { Slider } from '../../widgets/slider';
import { Checkbox } from '../../widgets/checkbox';
import { Root } from '../../core/root';
import { Widget } from '../../core/widget';
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

function findPanel(root: Root): Panel {
  return root.children[0] as Panel;
}

function findWidgets(panel: Panel) {
  const infoPanel = panel.children[10] as Panel;
  const settingsPanel = panel.children[11] as Panel;
  return {
    counterLabel: panel.children[0] as Button,
    incButton: panel.children[1] as Button,
    decButton: panel.children[2] as Button,
    resetButton: panel.children[3] as Button,
    redLabel: panel.children[4] as Button,
    redSlider: panel.children[5] as Slider,
    greenLabel: panel.children[6] as Button,
    greenSlider: panel.children[7] as Slider,
    blueLabel: panel.children[8] as Button,
    blueSlider: panel.children[9] as Slider,
    infoPanel,
    settingsPanel,
    infoLabel3: infoPanel.children[2] as Button,
    nameLabel: infoPanel.children[3] as Button,
    showHexCheckbox: settingsPanel.children[0] as Checkbox,
    extraInfoCheckbox: settingsPanel.children[1] as Checkbox,
    logButton: settingsPanel.children[2] as Button,
    statusLabel: panel.children[13] as Button,
  };
}

describe('Demo — createDemo', () => {
  it('1. Árvore monta sem erros', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root } = createDemo(canvas);

    expect(root).toBeInstanceOf(Root);
    expect(root.children).toHaveLength(1);

    const panel = root.children[0];
    expect(panel).toBeInstanceOf(Panel);
    expect(panel.children).toHaveLength(14);
  });

  it('2. Click no botão incrementa contador', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const { counterLabel, incButton } = findWidgets(panel);
    expect(counterLabel.label).toBe('Contador: 0');

    const absX = 40 + incButton.x + incButton.width / 2;
    const absY = 40 + incButton.y + incButton.height / 2;
    uiManager.dispatchMouseDown(absX, absY);
    uiManager.dispatchMouseUp(absX, absY);

    expect(counterLabel.label).toBe('Contador: 1');
  });

  it('3. Três cliques no botão', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const { counterLabel, incButton } = findWidgets(panel);

    const absX = 40 + incButton.x + incButton.width / 2;
    const absY = 40 + incButton.y + incButton.height / 2;

    for (let i = 0; i < 3; i++) {
      uiManager.dispatchMouseDown(absX, absY);
      uiManager.dispatchMouseUp(absX, absY);
    }

    expect(counterLabel.label).toBe('Contador: 3');
  });

  it('4. Slider altera label via drag', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const { redLabel, redSlider } = findWidgets(panel);

    expect(redLabel.label).toBe('Vermelho: 0.50');

    const sliderAbsX = 40 + redSlider.x;
    const sliderAbsY = 40 + redSlider.y;
    const handleCenterX = sliderAbsX + redSlider.handleX;
    const handleCenterY = sliderAbsY + redSlider.height / 2;

    uiManager.dispatchMouseDown(handleCenterX, handleCenterY);
    expect(uiManager.draggingNode).toBe(redSlider);

    const targetLocalX = 200;
    const targetAbsX = sliderAbsX + targetLocalX;
    uiManager.dispatchMouseMove(targetAbsX, handleCenterY);
    uiManager.dispatchMouseUp(targetAbsX, handleCenterY);

    expect(redLabel.label).not.toBe('Vermelho: 0.50');
    expect(redLabel.label).toMatch(/^Vermelho: /);
  });

  it('5. Checkbox alterna visibilidade do HEX', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const { settingsPanel, showHexCheckbox, infoLabel3 } = findWidgets(panel);

    expect(showHexCheckbox.checked).toBe(true);
    expect(infoLabel3.visible).toBe(true);

    const absX = 40 + settingsPanel.x + showHexCheckbox.x + showHexCheckbox.width / 2;
    const absY = 40 + settingsPanel.y + showHexCheckbox.y + showHexCheckbox.height / 2;
    uiManager.dispatchMouseDown(absX, absY);
    uiManager.dispatchMouseUp(absX, absY);

    expect(showHexCheckbox.checked).toBe(false);
    expect(infoLabel3.visible).toBe(false);

    uiManager.dispatchMouseDown(absX, absY);
    uiManager.dispatchMouseUp(absX, absY);

    expect(showHexCheckbox.checked).toBe(true);
    expect(infoLabel3.visible).toBe(true);
  });

  it('6. Hit-test não encontra subButton quando settingsPanel invisível', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const { settingsPanel, logButton } = findWidgets(panel);

    settingsPanel.visible = false;

    const absX = 40 + settingsPanel.x + logButton.x + logButton.width / 2;
    const absY = 40 + settingsPanel.y + logButton.y + logButton.height / 2;

    uiManager.dispatchMouseMove(absX, absY);

    expect(uiManager.hoveredNode).not.toBe(logButton);
  });

  it('7. removeChild + forgetNode limpa hoveredNode', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const X = new Widget({ x: 0, y: 0, width: 100, height: 40 });
    root.addChild(X);
    expect(root.children).toHaveLength(2);

    uiManager.hoveredNode = X;

    root.removeChild(X);

    expect(uiManager.hoveredNode).toBeNull();
    expect(root.children).toHaveLength(1);
  });

  it('8. destroy recursivo limpa toda subárvore', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const panel = findPanel(root);
    const children = [...panel.children];

    panel.destroy();

    expect(panel.parent).toBeNull();
    expect(panel.children).toHaveLength(0);
    for (const child of children) {
      expect(child.parent).toBeNull();
    }
    expect(uiManager.hoveredNode).toBeNull();
    expect(uiManager.activeNode).toBeNull();
  });

  it('9. Evento fantasma após remoção — onMouseLeave não chamado', () => {
    resetRedraw();
    const canvas = createMockCanvas();
    const { root, uiManager } = createDemo(canvas);

    const X = new Widget({ x: 0, y: 0, width: 100, height: 40 });
    root.addChild(X);

    const onMouseLeave = vi.fn();
    X.onMouseLeave = onMouseLeave;

    uiManager.hoveredNode = X;

    root.removeChild(X);
    expect(uiManager.hoveredNode).toBeNull();

    uiManager.dispatchMouseMove(50, 20);

    expect(onMouseLeave).not.toHaveBeenCalled();
    expect(uiManager.hoveredNode).toBeNull();
  });
});
