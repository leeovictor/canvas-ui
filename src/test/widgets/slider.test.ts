import { describe, it, expect } from 'vitest';
import { Slider } from '../../widgets/slider';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

describe('Slider', () => {
  const W = 200;
  const H = 30;
  const TRACK_H = 6;
  const RADIUS = 10;
  const HANDLE_W = RADIUS * 2;

  function makeSlider(value = 0.5): Slider {
    return new Slider({ x: 0, y: 0, width: W, height: H, value });
  }

  function render(slider: Slider): MockCtx {
    const mock = new MockCtx();
    slider.render(mock as unknown as CanvasRenderingContext2D, defaultTheme);
    return mock;
  }

  it('1. Render track — fillRect com largura total e altura trackHeight', () => {
    const slider = makeSlider();
    const mock = render(slider);

    const fillRects = mock.calls.filter(c => c.method === 'fillRect');
    expect(fillRects.length).toBe(2);

    const trackCall = fillRects[0];
    expect(trackCall.args).toEqual([0, H / 2 - TRACK_H / 2, W, TRACK_H]);
  });

  it('2. Render filled track — fillRect até handleX com cor accent', () => {
    const slider = makeSlider(0.5);
    const mock = render(slider);

    const fillRects = mock.calls.filter(c => c.method === 'fillRect');
    expect(fillRects.length).toBe(2);

    const trackWidth = W - HANDLE_W;
    const expectedHandleX = 0.5 * trackWidth + RADIUS;

    const filledCall = fillRects[1];
    expect(filledCall.args).toEqual([0, H / 2 - TRACK_H / 2, expectedHandleX, TRACK_H]);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[1].args[0]).toBe(defaultTheme.colors.accent);
  });

  it('3. Render handle — arc com centro em (handleX, centerY), raio handleRadius', () => {
    const slider = makeSlider(0.5);
    const mock = render(slider);

    const trackWidth = W - HANDLE_W;
    const expectedHandleX = 0.5 * trackWidth + RADIUS;

    const arcs = mock.calls.filter(c => c.method === 'arc');
    expect(arcs.length).toBe(1);
    expect(arcs[0].args).toEqual([expectedHandleX, H / 2, RADIUS, 0, Math.PI * 2]);
  });

  it('4. handleX posicional — value=0 → handleX = radius; value=1 → handleX = width - radius', () => {
    const trackWidth = W - HANDLE_W;

    const s0 = makeSlider(0);
    expect(s0.handleX).toBe(RADIUS);

    const s1 = makeSlider(1);
    expect(s1.handleX).toBe(W - RADIUS);

    const sMid = makeSlider(0.5);
    expect(sMid.handleX).toBe(0.5 * trackWidth + RADIUS);
  });

  it('5. setValueFromLocalX clampa — localX < radius → 0; localX > width - radius → 1', () => {
    const slider = makeSlider(0.5);

    slider.setValueFromLocalX(-100);
    expect(slider.value).toBe(0);

    slider.setValueFromLocalX(W + 100);
    expect(slider.value).toBe(1);
  });

  it('6. setValueFromLocalX onChange — dispara apenas quando value muda', () => {
    const slider = makeSlider(0.5);
    let calledWith: number | undefined;
    slider.onChange = (v) => { calledWith = v; };

    const trackWidth = W - HANDLE_W;
    const expectedValue = (50 - RADIUS) / trackWidth;
    slider.setValueFromLocalX(50);
    expect(calledWith).toBeCloseTo(expectedValue, 10);

    calledWith = undefined;
    slider.setValueFromLocalX(50);
    expect(calledWith).toBeUndefined();
  });

  it('7. hitTestHandle — centro do handle → true; borda fora → false', () => {
    const slider = makeSlider(0.5);
    const hx = slider.handleX;
    const hy = H / 2;

    expect(slider.hitTestHandle(hx, hy)).toBe(true);
    expect(slider.hitTestHandle(hx + RADIUS, hy)).toBe(true);
    expect(slider.hitTestHandle(hx - RADIUS, hy)).toBe(true);
    expect(slider.hitTestHandle(hx + RADIUS + 1, hy)).toBe(false);
    expect(slider.hitTestHandle(0, 0)).toBe(false);
  });

  it('8. Render disabled — cores desabilitadas', () => {
    const slider = makeSlider(0.5);
    slider.enabled = false;
    const mock = render(slider);

    const fillStyleCalls = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyleCalls[0].args[0]).toBe(defaultTheme.colors.disabled);

    expect(fillStyleCalls[1].args[0]).toBe(defaultTheme.colors.disabled);

    expect(fillStyleCalls[2].args[0]).toBe(defaultTheme.colors.disabled);

    const strokeStyleCalls = mock.calls.filter(c => c.method === 'setStrokeStyle');
    expect(strokeStyleCalls[0].args[0]).toBe(defaultTheme.colors.disabled);
  });

  it('9. Render invisible — nenhuma chamada de desenho', () => {
    const slider = makeSlider(0.5);
    slider.visible = false;
    const mock = render(slider);

    expect(mock.calls.length).toBe(0);
  });
});
