import { describe, it, expect } from 'vitest';
import { Panel } from '../../widgets/panel';
import { Button } from '../../widgets/button';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

describe('Panel', () => {
  function makeButton(): Button {
    return new Button({ x: 10, y: 10, width: 100, height: 40, label: 'OK' });
  }

  function makePanel(children?: Button[]): Panel {
    return new Panel({ x: 0, y: 0, width: 300, height: 200, children });
  }

  function render(panel: Panel): MockCtx {
    const mock = new MockCtx();
    panel.render(mock as unknown as CanvasRenderingContext2D, defaultTheme);
    return mock;
  }

  it('1. Render desenha fundo e filhos na ordem correta', () => {
    const btn = makeButton();
    const panel = makePanel([btn]);
    const mock = render(panel);

    const calls = mock.calls;
    expect(calls[0]).toEqual({ method: 'save', args: [] });
    expect(calls[1]).toEqual({ method: 'translate', args: [0, 0] });

    const fillRects = calls.filter(c => c.method === 'fillRect');
    expect(fillRects[0].args).toEqual([0, 0, 300, 200]);
    expect(fillRects[1].args).toEqual([0, 0, 100, 40]);

    const strokeRects = calls.filter(c => c.method === 'strokeRect');
    expect(strokeRects[0].args).toEqual([0, 0, 300, 200]);

    expect(calls[calls.length - 1]).toEqual({ method: 'restore', args: [] });
  });

  it('2. Render com title', () => {
    const panel = new Panel({ x: 0, y: 0, width: 300, height: 200, title: 'Config' });
    const mock = render(panel);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.find(t => t.args[0] === 'Config')).toBeDefined();
  });

  it('3. Hit-test sobre Button retorna Button', () => {
    const btn = makeButton();
    const panel = makePanel([btn]);
    expect(panel.hitTest(15, 15)).toBe(btn);
  });

  it('4. Hit-test sobre Panel sem filho retorna Panel', () => {
    const panel = makePanel();
    expect(panel.hitTest(150, 100)).toBe(panel);
  });

  it('5. Hit-test fora do Panel retorna null', () => {
    const panel = makePanel();
    expect(panel.hitTest(-1, -1)).toBeNull();
  });

  it('6. Panel aninhado — hit-test retorna Button mais profundo', () => {
    const btn = makeButton();
    const inner = new Panel({ x: 10, y: 10, width: 100, height: 100, children: [btn] });
    const outer = new Panel({ x: 0, y: 0, width: 300, height: 200, children: [inner] });
    expect(outer.hitTest(20, 20)).toBe(btn);
  });

  it('7. Panel com filho invisível — hit-test pula e retorna Panel', () => {
    const btn = makeButton();
    btn.visible = false;
    const panel = makePanel([btn]);
    expect(panel.hitTest(15, 15)).toBe(panel);
  });
});
