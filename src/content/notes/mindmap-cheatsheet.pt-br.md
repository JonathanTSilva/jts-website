---
slug: "mindmap-cheatsheet.pt-br"
title: "Tipos de Nota — Mapa Mental"
language: "pt-br"
translationKey: "mindmap-cheatsheet"
publishedAt: "2026-04-17"
noteType: mindmap
summary: "Um mapa mental de todos os tipos de nota suportados neste site, com seus principais campos e casos de uso."
category: "Engenharia"
tags: [cheatsheet, tipos-de-nota, referência]
colorToken: "#10b981"
---

# Sistema de Notas

## Nota Padrão

- Casos de Uso
    - Ensaios e escrita de longa forma
    - Escrita técnica
    - Entradas de conhecimento perene
- Campos Principais
    - summary
    - category
    - colorToken
    - tags
- Recursos de Conteúdo
    - Markdown completo
    - Blocos de código com destaque de sintaxe
    - Tabelas
    - Citações em bloco
    - Diagramas Mermaid
    - Divisores horizontais

## Nota de Livro

- Casos de Uso
    - Resenhas de livros
    - Notas de leitura
    - Resumos literários
- Campos Principais
    - author
    - cover
    - pages
    - rating
    - status
        - finished
        - reading
        - abandoned
    - dateRead
    - publishDate
    - relatedTo
    - previousBook
    - nextBook
- Recursos de Conteúdo
    - Prosa de resenha estruturada
    - Citações e destaques
    - Tabelas

## Nota de Mapa Mental

- Casos de Uso
    - Mapeamento conceitual
    - Estruturas de conhecimento
    - Árvores de decisão
- Sintaxe
    - H1 → nó raiz
    - H2 → ramo
    - Lista não-ordenada → filhos
        - Indentação = profundidade
        - Até 4+ níveis
- Recursos de Conteúdo
    - Rolagem horizontal
    - Cores de linha adaptadas ao tema
    - Recolhimento via CSS

## Nota de Quadro Branco

- Casos de Uso
    - Sessões de brainstorming
    - Diagramas rápidos
    - Referências em estilo esboço
    - Checklists visuais
- Recursos de Conteúdo
    - Layout em duas colunas CSS
    - Fonte manuscrita Patrick Hand
    - Negrito = tinta de marcador azul
    - Itálico = tinta de marcador vermelho
    - Réguas horizontais como divisores
    - Botão copiar como imagem

## Campos Compartilhados

- slug
    - Formato: slug.linguagem
    - Ex: note-cheatsheet.pt-br
- translationKey
    - Liga versões EN e PT-BR
    - Aciona o seletor de idioma
- colorToken
    - Valor de cor CSS diretamente
    - Sobrescreve o destaque da categoria
- tags
    - Exibição em pílulas monoespaçadas
    - Mostradas no card e no detalhe
- category
    - Controla a cor de destaque padrão
    - Agrupa cards na barra de filtros
