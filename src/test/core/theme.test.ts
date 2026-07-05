import { describe, it, expect } from 'vitest';
import { defaultTheme } from '../../core/theme';

describe('Theme', () => {
  it('defaultTheme has all color properties', () => {
    const colors = defaultTheme.colors;
    expect(colors.primary).toBeDefined();
    expect(colors.background).toBeDefined();
    expect(colors.border).toBeDefined();
    expect(colors.text).toBeDefined();
    expect(colors.hover).toBeDefined();
    expect(colors.pressed).toBeDefined();
    expect(colors.disabled).toBeDefined();
    expect(colors.accent).toBeDefined();
    expect(colors.surface).toBeDefined();
  });

  it('defaultTheme has font and fontSize', () => {
    expect(defaultTheme.font).toBeDefined();
    expect(defaultTheme.fontSize).toBeGreaterThan(0);
  });

  it('all defaultTheme colors are strings', () => {
    const colors = defaultTheme.colors;
    const colorValues = Object.values(colors);
    colorValues.forEach((color) => {
      expect(typeof color).toBe('string');
    });
  });

  it('defaultTheme font is a string', () => {
    expect(typeof defaultTheme.font).toBe('string');
  });

  it('defaultTheme fontSize is a number', () => {
    expect(typeof defaultTheme.fontSize).toBe('number');
  });
});
