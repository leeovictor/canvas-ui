import { describe, it, expect } from 'vitest';
import { Button } from '../../widgets/button';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

describe('Button', () => {
  it('1. Render default — fillRect com primary', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    const fills = mock.calls.filter(c => c.method === 'fillRect');
    expect(fills.length).toBe(1);
    expect(fills[0].args).toEqual([0, 0, 100, 40]);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls.length).toBe(2);
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.primary);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.length).toBe(1);
    expect(texts[0].args).toEqual(['OK', 50, 20]);
  });

  it('2. Render hovered — fillStyle = hover', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    btn.hovered = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.hover);
  });

  it('3. Render pressed — fillStyle = pressed', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    btn.pressed = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.pressed);
  });

  it('4. Render disabled — fillStyle = disabled', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    btn.enabled = false;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.disabled);
  });

  it('5. Render invisible — nenhuma chamada de desenho', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    btn.visible = false;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    expect(mock.calls.length).toBe(0);
  });

  it('6. Pressed + hovered — pressed tem prioridade', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    btn.pressed = true;
    btn.hovered = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.pressed);
  });

  it('7. Centralização de texto — textAlign e textBaseline corretos', () => {
    const btn = new Button({ x: 0, y: 0, width: 100, height: 40, label: 'OK' });
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    btn.render(ctx, defaultTheme);

    expect(mock.textAlign).toBe('center');
    expect(mock.textBaseline).toBe('middle');

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts[0].args).toEqual(['OK', 50, 20]);
  });
});
