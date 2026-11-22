---
slug: "fixture-whiteboard"
title: "Nota de Quadro Branco — Fixture"
language: "pt-br"
translationKey: "fixture-whiteboard"
publishedAt: "2026-04-17"
noteType: whiteboard
summary: "Layout de referência para notas de quadro branco. O conteúdo flui em duas colunas CSS com altura fixa, estilizado com a fonte Patrick Hand."
category: "Engenharia"
tags: [fixture, referência, quadro-branco]
colorToken: "#f59e0b"
---

# Nota de Quadro Branco — Fixture

**Tipo:** `whiteboard` · **Fonte:** Patrick Hand · **Layout:** 2 colunas CSS

---

## Estilos de Texto

**Negrito** → tinta de marcador _azul_

_Itálico_ → tinta de marcador _vermelho_

**_Negrito itálico_** → destaque crítico

`código inline` → monoespaçado

~~tachado~~ → depreciado

---

## Listas

Não-ordenada:
- Item um
- Item dois
  - Item aninhado

Ordenada:
1. Passo um
2. Passo dois
3. Passo três

---

## Frontmatter

`noteType: whiteboard` ← obrigatório

`colorToken` → cor de destaque do quadro

`tags` → exibidas _abaixo_ do quadro

`summary` → apenas no card do índice

---

## Dicas

O conteúdo flui naturalmente — o CSS cuida das colunas. Use `---` como divisor visual de seções. Mantenha o conteúdo **curto** para caber na altura fixa.

O botão **copiar como imagem** aparece no canto superior direito ao passar o mouse no desktop.
