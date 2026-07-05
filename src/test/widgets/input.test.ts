import { describe, it, expect, vi } from 'vitest';
import { Input } from '../../widgets/input';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

function createInput(overrides?: Partial<ConstructorParameters<typeof Input>[0]>) {
  return new Input({
    x: 0, y: 0, width: 200, height: 36,
    placeholder: 'Digite...',
    ...overrides,
  });
}

function mockKeyEvent(overrides: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    key: '',
    keylength: 1,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    preventDefault: () => {},
    ...overrides,
  } as unknown as KeyboardEvent;
}

describe('Input', () => {
  it('1. Render default — fillRect fundo + strokeRect borda', () => {
    const input = createInput();
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const fills = mock.calls.filter(c => c.method === 'fillRect');
    expect(fills.length).toBe(1);
    expect(fills[0].args).toEqual([0, 0, 200, 36]);

    const strokes = mock.calls.filter(c => c.method === 'strokeRect');
    expect(strokes.length).toBe(1);
    expect(strokes[0].args).toEqual([0, 0, 200, 36]);

    const fillStyles = mock.calls.filter(c => c.method === 'setFillStyle');
    expect(fillStyles[0].args[0]).toBe(defaultTheme.colors.background);

    const strokeStyles = mock.calls.filter(c => c.method === 'setStrokeStyle');
    expect(strokeStyles[0].args[0]).toBe(defaultTheme.colors.border);
  });

  it('2. Render focused — borda com primary', () => {
    const input = createInput();
    input.focused = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const strokeStyles = mock.calls.filter(c => c.method === 'setStrokeStyle');
    expect(strokeStyles[0].args[0]).toBe(defaultTheme.colors.primary);
  });

  it('3. Render with text — fillText chamado com value', () => {
    const input = createInput({ value: 'abc' });
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.length).toBe(1);
    expect(texts[0].args[0]).toBe('abc');

    const fillStyles = mock.calls.filter(c => c.method === 'setFillStyle');
    const textFillStyle = fillStyles[fillStyles.length - 1];
    expect(textFillStyle.args[0]).toBe(defaultTheme.colors.text);
  });

  it('4. Render placeholder — fillText chamado com placeholder quando vazio', () => {
    const input = createInput({ value: '' });
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.length).toBe(1);
    expect(texts[0].args[0]).toBe('Digite...');

    const fillStyles = mock.calls.filter(c => c.method === 'setFillStyle');
    const placeholderFillStyle = fillStyles[fillStyles.length - 1];
    expect(placeholderFillStyle.args[0]).toBe(defaultTheme.colors.placeholder);
  });

  it('5. Placeholder escondido quando value preenchido', () => {
    const input = createInput({ value: 'ok' });
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const texts = mock.calls.filter(c => c.method === 'fillText');
    expect(texts.length).toBe(1);
    expect(texts[0].args[0]).toBe('ok');
  });

  it('6. Render invisible — zero chamadas de desenho', () => {
    const input = createInput();
    input.visible = false;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    expect(mock.calls.length).toBe(0);
  });

  it('7. Render disabled — strokeStyle disabled', () => {
    const input = createInput();
    input.enabled = false;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const strokeStyles = mock.calls.filter(c => c.method === 'setStrokeStyle');
    expect(strokeStyles[0].args[0]).toBe(defaultTheme.colors.disabled);
  });

  it('8. handleKeyDown insere caractere', () => {
    const input = createInput();
    const ev = mockKeyEvent({ key: 'a' });
    input.handleKeyDown(ev);
    expect(input.value).toBe('a');
    expect(input.caretIndex).toBe(1);
  });

  it('9. handleKeyDown Backspace remove caractere', () => {
    const input = createInput({ value: 'ab' });
    input.caretIndex = 2;
    const ev = mockKeyEvent({ key: 'Backspace' });
    input.handleKeyDown(ev);
    expect(input.value).toBe('a');
    expect(input.caretIndex).toBe(1);
  });

  it('10. handleKeyDown Delete remove caractere apos caret', () => {
    const input = createInput({ value: 'ab' });
    input.caretIndex = 0;
    const ev = mockKeyEvent({ key: 'Delete' });
    input.handleKeyDown(ev);
    expect(input.value).toBe('b');
    expect(input.caretIndex).toBe(0);
  });

  it('11. handleKeyDown ArrowLeft / ArrowRight move caret', () => {
    const input = createInput({ value: 'abc' });
    input.caretIndex = 2;

    input.handleKeyDown(mockKeyEvent({ key: 'ArrowLeft' }));
    expect(input.caretIndex).toBe(1);

    input.handleKeyDown(mockKeyEvent({ key: 'ArrowRight' }));
    expect(input.caretIndex).toBe(2);
  });

  it('12. handleKeyDown Home / End move caret', () => {
    const input = createInput({ value: 'abc' });
    input.caretIndex = 2;

    input.handleKeyDown(mockKeyEvent({ key: 'Home' }));
    expect(input.caretIndex).toBe(0);

    input.handleKeyDown(mockKeyEvent({ key: 'End' }));
    expect(input.caretIndex).toBe(3);
  });

  it('13. handleKeyDown ignorado quando disabled', () => {
    const input = createInput();
    input.enabled = false;
    const result = input.handleKeyDown(mockKeyEvent({ key: 'a' }));
    expect(result).toBe(false);
    expect(input.value).toBe('');
  });

  it('14. maxLength respeitado', () => {
    const input = createInput({ maxLength: 3 });
    input.handleKeyDown(mockKeyEvent({ key: 'a' }));
    input.handleKeyDown(mockKeyEvent({ key: 'b' }));
    input.handleKeyDown(mockKeyEvent({ key: 'c' }));
    expect(input.value).toBe('abc');
    input.handleKeyDown(mockKeyEvent({ key: 'd' }));
    expect(input.value).toBe('abc');
  });

  it('15. onChange disparado apos insercao', () => {
    const onChange = vi.fn();
    const input = createInput({ onChange });
    input.handleKeyDown(mockKeyEvent({ key: 'x' }));
    expect(onChange).toHaveBeenCalledWith('x');
  });

  it('16. Caret desenhado quando focused + blinkVisible', () => {
    const input = createInput({ value: 'abc' });
    input.focused = true;
    (input as unknown as Record<string, boolean>)._blinkVisible = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const caretFills = mock.calls.filter(
      c => c.method === 'fillRect' && c.args[2] === Input.CARET_WIDTH
    );
    expect(caretFills.length).toBe(1);
  });

  it('17. Caret nao desenhado quando blur', () => {
    const input = createInput({ value: 'abc' });
    input.focused = false;
    (input as unknown as Record<string, boolean>)._blinkVisible = true;
    const mock = new MockCtx();
    const ctx = mock as unknown as CanvasRenderingContext2D;

    input.render(ctx, defaultTheme);

    const caretFills = mock.calls.filter(
      c => c.method === 'fillRect' && c.args[2] === Input.CARET_WIDTH
    );
    expect(caretFills.length).toBe(0);
  });

  it('18. handleFocus / handleBlur gerenciam blink', () => {
    const input = createInput();
    expect((input as unknown as Record<string, boolean>)._blinkVisible).toBe(false);

    input.handleFocus();
    expect((input as unknown as Record<string, boolean>)._blinkTimer).not.toBe(null);

    input.handleBlur();
    expect((input as unknown as Record<string, boolean>)._blinkTimer).toBe(null);
    expect((input as unknown as Record<string, boolean>)._blinkVisible).toBe(false);
  });

  it('19. destroy limpa timer', () => {
    const input = createInput();
    input.handleFocus();
    input.destroy();
    expect((input as unknown as Record<string, null>)._blinkTimer).toBe(null);
  });
});
