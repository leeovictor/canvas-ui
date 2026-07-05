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
