import { describe, it, expect } from 'vitest';
import { Checkbox } from '../../widgets/checkbox';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

describe('Checkbox', () => {
  const BOX_SIZE = 20;

  function makeCheckbox(): Checkbox {
    return new Checkbox({ x: 0, y: 0, width: 100, height: BOX_SIZE, label: 'Opção 1' });
  }

  function render(cb: Checkbox): MockCtx {
    const mock = new MockCtx();
    cb.render(mock as unknown as CanvasRenderingContext2D, defaultTheme);
    return mock;
  }

  it('1. Render unchecked — não contém checkmark', () => {
    const cb = makeCheckbox();
    const mock = render(cb);

    const fills = mock.calls.filter(c => c.method === 'fillRect');
    expect(fills.length).toBe(1);
    expect(fills[0].args).toEqual([0, 0, BOX_SIZE, BOX_SIZE]);

    const strokes = mock.calls.filter(c => c.method === 'strokeRect');
    expect(strokes.length).toBe(1);
    expect(strokes[0].args).toEqual([0, 0, BOX_SIZE, BOX_SIZE]);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.find(t => t.args[0] === '✓')).toBeUndefined();
    expect(texts.find(t => t.args[0] === 'Opção 1')).toBeDefined();
  });

  it('2. Render checked — checkmark presente', () => {
    const cb = makeCheckbox();
    cb.checked = true;
    const mock = render(cb);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.find(t => t.args[0] === '✓')).toBeDefined();
  });

  it('3. Click alterna estado', () => {
    const cb = makeCheckbox();
    const e = {} as MouseEvent;
    expect(cb.checked).toBe(false);
    cb.onClick!(e);
    expect(cb.checked).toBe(true);
    cb.onClick!(e);
    expect(cb.checked).toBe(false);
  });

  it('4. onChange dispara', () => {
    const cb = makeCheckbox();
    const e = {} as MouseEvent;
    let calledWith: boolean | undefined;
    cb.onChange = (v) => { calledWith = v; };
    cb.onClick!(e);
    expect(calledWith).toBe(true);
    cb.onClick!(e);
    expect(calledWith).toBe(false);
  });

  it('5. Render hovered — strokeStyle = hover', () => {
    const cb = makeCheckbox();
    cb.hovered = true;
    const mock = render(cb);

    const strokeStyleCalls = mock.calls.filter(c => c.method === 'setStrokeStyle');
    expect(strokeStyleCalls[0].args[0]).toBe(defaultTheme.colors.hover);
  });

  it('6. Render disabled — fundo desabilitado, onClick não alterna', () => {
    const cb = makeCheckbox();
    cb.enabled = false;
    const mock = render(cb);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.disabled);

    const e = {} as MouseEvent;
    cb.onClick!(e);
    expect(cb.checked).toBe(false);
  });

  it('7. Render invisible — nenhuma chamada de desenho', () => {
    const cb = makeCheckbox();
    cb.visible = false;
    const mock = render(cb);

    expect(mock.calls.length).toBe(0);
  });
});
