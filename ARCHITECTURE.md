# Canvas UI — Arquitetura Geral

## Proposta

Sistema de UI **retained mode** renderizado em `<canvas>` HTML via **Canvas 2D API puro** (sem WebGL, sem bibliotecas externas). Estudo de conceito para entender como sistemas de UI funcionam "por baixo do capô": hit-testing, layout, foco, eventos, ciclo de vida.

## Paradigma central: Retained Mode

Uma **árvore de objetos (scene graph)** persiste entre frames. Cada nó guarda seu estado (posição, tamanho, hover, pressed, focused). O loop de renderização percorre essa árvore e desenha; a lógica de interação também vive nela.

**Não** é immediate mode (Dear ImGui/egui), onde a UI é redescrita a cada frame sem estado persistente.

## Camadas da arquitetura

```
Eventos DOM (canvas)
       |
       v
  UIManager ──→ hitTest() percorre árvore
       |            (depth-first reverso)
       |
       ├── hoveredNode, activeNode, focusedNode, draggingNode
       ├── dispatchMouseMove/Down/Up(x, y)
       └── sincroniza flags nos widgets
              |
              v
       Widget callbacks (onClick, onMouseEnter, ...)

  eventLoop (requestAnimationFrame)
       |
       v
  root.render(ctx) ──→ Container.render ──→ Widget.render
       │                     │                     │
       │                ctx.save()            desenha em
       │                ctx.translate        coords locais
       │                ctx.restore()       [0..w, 0..h]
       v
  <canvas> real
```

## Nomenclatura e convenções

- Idioma: inglês na API pública (`addChild`, `hitTest`, `render`). Comentários e docs em português.
- `x`, `y` são **relativos ao pai**. Widgets desenham em coordenadas locais `[0..width, 0..height]`.
- Z-order: implícito pela ordem no array `children`; último = visualmente acima.
- UIManager é a única fonte autoritativa de flags (`hovered`, `pressed`, `focused`).
- Widgets **não** setam suas próprias flags de interação — UIManager as gerencia.

## Estrutura de diretórios

```
src/
  core/
    widget.ts        classe base Widget (geometria, hierarquia, flags)
    container.ts     Container genérico com translate no render
    root.ts          Root container sem visual, ponto de entrada
    theme.ts         objeto de tema + tipo Theme
    uimanager.ts     estado global de interação + dispatch de eventos
    eventloop.ts     requestAnimationFrame + needsRedraw
    hittest.ts       hit-test depth-first reverso (função pura)
  widgets/
    button.ts
    panel.ts         container com fundo
    checkbox.ts
    slider.ts
  demo/
    demo.ts          monta e retorna a árvore de demonstração
  test/
    helpers/
      mockCtx.ts     stub de CanvasRenderingContext2D (recorder)
      fixtures.ts    builders de árvores comuns p/ testes
    *.test.ts        testes Vitest, um por módulo/fase
  main.ts            entrypoint: canvas + UIManager + demo
  style.css          reset mínimo + estilo do canvas
  smoke.test.ts      teste de fumaça (já existe)
```

## Decisões arquiteturais chave

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Toolchain | Vite + TypeScript | Tipagem ajuda a modelar a árvore; dev server s/ framework UI. |
| devicePixelRatio | Fora do MVP | Aceitar leve blur em Retina por simplicidade inicial. |
| Slider | Só arrasto horizontal | Teclado fica para extensão. |
| Testes sem jsdom | UIManager expõe dispatch internos | Testes rodam em node puro, sem dependência extra. |
| Render assertions | MockCtx recorder | stub grava chamadas/args; asserções sobre sequência e coordenadas. |
| Clipping | Sem ctx.clip no MVP | Filhos podem "vazar" do pai; documentado como limitação. |
| Cursor | UIManager seta canvas.style.cursor | Feedback visual imediato sem redezenho. |

## Riscos e pontos de atenção (Canvas 2D)

1. **save/restore desbalanceado** — todo `save` deve ter `restore` no mesmo escopo. `Container.render` é responsável por isso.
2. **Captura de mouse fora do canvas** — durante drag, registrar `mouseup/mousemove` no `window` e não no canvas.
3. **Reentrância de callbacks** — `onClick` que modifica a árvore pode invalidar iteração. UIManager adia mutations estruturais para pós-flush.
4. **Texto** — centralização vertical aproximada (`textBaseline='middle'` + `textAlign='center'`). `measureText` retorna largura aproximada para testes.
5. **Coordenadas** — hit-test converte absoluto→local acumulando translates durante descida recursiva. Lógica sensível.

## Ordem das fases de implementação

| Fase | Título | Depende de |
|------|--------|------------|
| M1 | Fundação (Widget, Container, Root, hit-test, mockCtx, eventLoop) | — |
| M2 | Hover (UIManager branch hover) | M1 |
| M3 | Clique + Button (UIManager branch click, Button) | M2 |
| M4 | Checkbox + Panel (Checkbox, Panel) | M3 |
| M5 | Slider + drag (UIManager branch drag, Slider) | M4 |
| M6 | Demo + limpeza (demo.ts, removeChild cleanup, destroy) | M5 |

Cada fase segue TDD: **testes primeiro (vermelho) → implementação até verde → checkpoint visual no navegador**.
