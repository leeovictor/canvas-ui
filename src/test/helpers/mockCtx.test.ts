import { describe, it, expect } from 'vitest';
import { MockCtx } from './mockCtx';

describe('MockCtx', () => {
  it('save registers a call', () => {
    const ctx = new MockCtx();
    ctx.save();
    expect(ctx.calls).toHaveLength(1);
    expect(ctx.calls[0]).toEqual({ method: 'save', args: [] });
  });

  it('restore registers a call', () => {
    const ctx = new MockCtx();
    ctx.restore();
    expect(ctx.calls).toEqual([{ method: 'restore', args: [] }]);
  });

  it('translate registers a call with coordinates', () => {
    const ctx = new MockCtx();
    ctx.translate(10, 20);
    expect(ctx.calls[0]).toEqual({ method: 'translate', args: [10, 20] });
  });

  it('fillRect registers a call with dimensions', () => {
    const ctx = new MockCtx();
    ctx.fillRect(1, 2, 100, 200);
    expect(ctx.calls[0]).toEqual({ method: 'fillRect', args: [1, 2, 100, 200] });
  });

  it('strokeRect registers a call', () => {
    const ctx = new MockCtx();
    ctx.strokeRect(0, 0, 50, 50);
    expect(ctx.calls[0]).toEqual({ method: 'strokeRect', args: [0, 0, 50, 50] });
  });

  it('clearRect registers a call', () => {
    const ctx = new MockCtx();
    ctx.clearRect(0, 0, 800, 600);
    expect(ctx.calls[0]).toEqual({ method: 'clearRect', args: [0, 0, 800, 600] });
  });

  it('fillText registers a call with text and position', () => {
    const ctx = new MockCtx();
    ctx.fillText('hello', 10, 20);
    expect(ctx.calls[0]).toEqual({ method: 'fillText', args: ['hello', 10, 20] });
  });

  it('clear() empties the calls array', () => {
    const ctx = new MockCtx();
    ctx.save();
    ctx.fillRect(0, 0, 10, 10);
    ctx.clear();
    expect(ctx.calls).toHaveLength(0);
  });

  it('fillStyle defaults to #000', () => {
    const ctx = new MockCtx();
    expect(ctx.fillStyle).toBe('#000');
  });

  it('strokeStyle defaults to #000', () => {
    const ctx = new MockCtx();
    expect(ctx.strokeStyle).toBe('#000');
  });

  it('measureText returns width based on text length', () => {
    const ctx = new MockCtx();
    expect(ctx.measureText('hello').width).toBe(40);
  });

  it('canvas dimensions default to 800x600', () => {
    const ctx = new MockCtx();
    expect(ctx.canvas.width).toBe(800);
    expect(ctx.canvas.height).toBe(600);
  });
});
