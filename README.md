> **Nota:** Este é um projeto de estudos pessoais, criado para explorar conceitos de renderização de interfaces de usuário em Canvas 2D. Não é uma biblioteca pronta para produção.

# Canvas UI

Sistema de UI **retained mode** renderizado inteiramente em `<canvas>` HTML via **Canvas 2D API pura** — sem WebGL, sem bibliotecas externas, sem framework.

O objetivo é entender como sistemas de UI funcionam "por baixo do capô":
*hit-testing, layout, foco, eventos, ciclo de vida, scene graph*.

## Stack

- **Vite** — dev server e build
- **TypeScript** — modelagem da árvore de widgets
- **Vitest** — testes unitários (TDD)
- **Canvas 2D API** — renderização (nenhuma dependência de UI)

## Estrutura de dados: Scene Graph

A árvore de widgets (scene graph) é composta por nós que estendem a classe base `Widget`:

```
Widget (base)
├── Container  (herda Widget, adiciona ctx.translate no render)
│   ├── Root   (raiz da árvore, sem translate)
│   ├── Panel  (container com fundo e título)
│   └── ...    (qualquer Container pode ter filhos)
├── Button     (widget folha)
├── Checkbox   (widget folha)
├── Slider     (widget folha, com hit-test próprio no handle)
└── Input      (widget folha, com foco e teclado)
```

Cada `Widget` armazena:

| Campo       | Tipo             | Descrição                                         |
|-------------|------------------|---------------------------------------------------|
| `x`, `y`    | `number`         | Posição **relativa ao pai** (coordenadas locais)  |
| `width`, `height` | `number`    | Tamanho do widget                                 |
| `parent`    | `Widget \| null` | Referência ao nó pai                              |
| `children`  | `Widget[]`       | Filhos (último = visualmente acima, z-order)      |
| `visible`   | `boolean`        | Se o widget e seus filhos são renderizados        |
| `enabled`   | `boolean`        | Se o widget responde a interação                  |
| `hovered`   | `boolean`        | Gerenciado pelo UIManager (não setar manualmente) |
| `pressed`   | `boolean`        | Gerenciado pelo UIManager                         |
| `focused`   | `boolean`        | Gerenciado pelo UIManager                         |
| `onClick`, `onMouseEnter`, `onMouseLeave` | callbacks | Disparados pelo UIManager |

O fluxo de dados é **unidirecional**: eventos DOM → `UIManager` → atualiza flags nos widgets → `eventLoop` → `root.render(ctx, theme)` percorre a árvore desenhando.

## Hit-test: como funciona

O hit-test resolve a pergunta: **dada uma coordenada absoluta (x, y) no canvas, qual o widget mais específico sob o ponteiro?**

### Algoritmo

```
hitTestTree(root, absX, absY)
  └→ root.hitTest(absX, absY)
       └→ itera children de trás pra frente (z-order)
            ├── converte coordenada absoluta → local (subtrai child.x, child.y)
            ├── child.hitTest(localX, localY)  ← recursão depth-first
            └── se retornar um widget, propaga (early return)
       └── se nenhum filho acertou:
            ├── verifica se (localX, localY) está dentro de [0, width] × [0, height]
            └── se sim, retorna o próprio nó
       └── se não, retorna null
```

O algoritmo:
1. Começa no `Root` com coordenadas absolutas do canvas.
2. Desce a árvore em **depth-first reverso** (último filho primeiro), pois o último filho na lista está visualmente acima (z-order implícito).
3. Em cada nó, **converte coordenadas absolutas para o sistema de coordenadas do filho**: `childLocalX = localX - child.x; childLocalY = localY - child.y`.
4. A primeira sub-árvore que retornar um widget não-null interrompe a descida — isso garante que o widget **mais acima** (visualmente) seja selecionado.
5. Se nenhum filho foi hit, o nó verifica se o ponto está dentro do seu retângulo. `Container` e `Root` também ignoram filhos invisíveis ou desabilitados.
6. Retorna o widget folha mais específico, ou `null` se o ponto não caiu em nada.

### Contraste: Widget vs Container

- `Widget.hitTest`: itera todos os filhos (sem checar `visible`/`enabled`), depois testa o próprio retângulo. Usado por widgets folha que não têm translate próprio (como Button, Checkbox).
- `Container.hitTest`: filtra filhos invisíveis/desabilitados, depois testa o próprio retângulo. Usado por containers que aplicam `ctx.translate` no render.
- `Root.hitTest`: delega para `Container.hitTest`. A diferença está no `render` — Root não aplica translate, pois é a origem absoluta.

### Exemplo concreto

```
Root (0,0, 800x600)
  └── Panel (100,50, 300x200)
       ├── Button (10,10, 120x40)
       └── Button (10,60, 120x40)
```

Clique na posição absoluta (130, 80):
1. `Root.hitTest(130, 80)` → itera filho Panel
2. `Panel.hitTest(130, 80)` → converte para local: `(130-100, 80-50) = (30, 30)` → itera filhos de trás pra frente
3. `2º Button.hitTest(30, 30)` → converte para local: `(30-10, 30-60) = (20, -30)` → y negativo, fora do retângulo → `null`
4. `1º Button.hitTest(30, 30)` → converte para local: `(30-10, 30-10) = (20, 20)` → dentro de (0,0, 120x40) → retorna o Button

Resultado: o primeiro Button é o hit.

### Uso no UIManager

O `UIManager` usa `hitTestTree` em três momentos:

| Evento         | Como usa o hit-test                                                                 |
|----------------|--------------------------------------------------------------------------------------|
| `mousemove`    | Descobre o widget sob o mouse para atualizar `hoveredNode` e disparar `onMouseEnter`/`onMouseLeave` |
| `mousedown`    | Descobre o alvo do clique; se for Slider, testa o handle separadamente (`hitTestHandle`) para iniciar drag |
| `mouseup`      | Confirma se o mouse ainda está sobre o mesmo `activeNode` para disparar `onClick`    |

O hit-test também determina a mudança de cursor (`updateCursor`) e o gerenciamento de foco (especialmente para `Input`). Durante drag do Slider, **não** executa hit-test — usa as coordenadas diretamente para calcular o valor.

### Especificidades por widget

- **Slider**: tem `hitTestHandle(localX, localY)` próprio que testa colisão circular com o handle (distância euclidiana ≤ raio). Isso permite clicar/dragar apenas no botão, não no trilho inteiro.
- **Input**: recebe foco via `mousedown`; o hit-test determina se o clique foi no Input para então atribuir `focusedNode` e iniciar o piscar do caret.
- **Panel** (Container): passa no hit-test se clicar na área visível, permitindo que painéis inteiros sejam alvos de interação (útil para drag de janelas, por exemplo).

## Estrutura

```
src/
├── core/          Widget base, Container, Root, Theme, UIManager, EventLoop, hit-test
├── widgets/       Button, Checkbox, Slider, Panel
├── demo/          Montagem da árvore de demonstração
├── test/          Helpers e builders para testes
├── main.ts        Entrypoint: canvas + UIManager + demo
└── smoke.test.ts  Teste de fumaça
```

## Scripts

| Comando            | Descrição                    |
| ------------------ | ---------------------------- |
| `npm run dev`      | Inicia servidor de desenvolvimento |
| `npm run build`    | Compila TypeScript + build Vite   |
| `npm run preview`  | Preview do build de produção      |
| `npm test`         | Executa os testes (Vitest)        |
| `npm run test:watch` | Testes em modo watch           |

## Fases de implementação

Cada fase seguiu TDD: testes primeiro → implementação → verificação visual.

| Fase | Título                                      |
|------|---------------------------------------------|
| M1   | Fundação (Widget, Container, Root, hit-test, eventLoop) |
| M2   | Hover                                       |
| M3   | Clique + Button                             |
| M4   | Checkbox + Panel                            |
| M5   | Slider + drag                               |
| M6   | Demo + limpeza                              |

---

Projeto inspirado pela curiosidade de entender o *funcionamento interno* de toolkits de UI como Flutter, Qt, Windows Forms e afins.
