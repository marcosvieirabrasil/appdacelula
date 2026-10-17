/Users/macbook/.zprofile:9: no such file or directory: /usr/local/bin/brew
---
name: App da Célula
description: Um espaço operacional para líderes prepararem e conduzirem encontros de célula.
colors:
  canvas: "#09090a"
  panel: "#1a1a1c"
  ink: "#f5f1eb"
  orange: "#f47720"
  orange-hot: "#ff8d38"
  glass: "rgba(31,31,33,.66)"
  rule: "rgba(255,255,255,.115)"
typography:
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  panel: "17px"
  control: "10px"
spacing:
  compact: "12px"
  standard: "20px"
  section: "64px"
---

# Design System: App da Célula

## Overview

**Creative North Star: "A chama que reúne"**

App da Célula é uma ferramenta noturna, acolhedora e pronta para uso. O primeiro olhar encontra o encontro que está chegando; o segundo encontra o gesto que ajuda o líder a conduzi-lo. O design fala de presença e calor, sem cair em uma tela de marketing ou em um painel administrativo genérico.

O preto cria quietude e foco. O laranja aparece como a chama: reservado à ação decisiva, ao progresso e a pequenos sinais de vida. As superfícies de vidro organizam as camadas de trabalho — navegação, conteúdo e detalhes — deixando a profundidade aparecer sem competir com a leitura.

## Colors

- **Void** (`#09090a`): fundo contínuo que segura a interface.
- **Black** (`#101012`): superfícies mais opacas e regiões estruturais.
- **Glass** (`rgba(31,31,33,.66)`): cartões, atalhos e camadas que pedem separação suave.
- **Ink** (`#f5f1eb`): conteúdo de leitura prioritário.
- **Orange** (`#f47720`): ação primária e estado selecionado.
- **Orange Hot** (`#ff8d38`): feedback de hover e pequenos acentos.
- **Hairline** (`rgba(255,255,255,.115)`): fronteiras de vidro e separação estrutural.

**The One Flame Rule.** Em um mesmo contexto, o laranja sólido pertence à ação mais importante. O restante usa vidro escuro, contorno fino ou texto.

## Typography

**Display and body:** Manrope, Arial, sans-serif.

Uma só família mantém a interface legível antes e durante a célula. Títulos usam peso 800 e tracking negativo; comandos e metadados usam peso 700–800. Etiquetas pequenas usam caixa alta com espaçamento, mas textos longos continuam em linguagem natural.

- **Headline:** 26–46px, 800, line-height 1.06, letter-spacing -0.055em.
- **Body:** 12–14px, 500, line-height 1.45–1.6.
- **Labels:** 9–11px, 800, letter-spacing 0.08–0.1em.

## Layout

No desktop existem três camadas: navegação persistente de 238px, espaço de trabalho fluido e inspetor de dinâmica de 365px. A primeira seção é o próximo encontro, seguido de atalhos e biblioteca. Em telas médias a navegação se comprime; no celular vira barra horizontal e o inspetor se torna uma folha inferior.

O ritmo principal é 12px para grupos próximos, 20px dentro de uma superfície e 48–64px entre tarefas maiores.

## Glass & Depth

O vidro não é um efeito decorativo: ele sinaliza uma camada acima do fundo. Navegação, cartões de atalho, biblioteca e inspetor usam transparência escura, borda clara sutil e blur moderado. Ação primária permanece opaca para ser reconhecida rapidamente.

Para pessoas que reduzirem transparência no sistema, o app substitui o vidro por superfícies sólidas. Movimento também respeita `prefers-reduced-motion`.

## Components

### Buttons

- **Primary:** laranja sólido com texto escuro; ação decisiva do fluxo.
- **Focus:** vidro escuro com contorno; inicia ou encerra modo encontro.
- **Text:** sem superfície; ação secundária dentro de um contexto já ativo.

### Navigation

O item ativo recebe vidro laranja escuro e contorno quente. Ícones são SVGs de traço consistente, sem emoji ou símbolos decorativos.

### Activity cards

Cartões apresentam categoria, salvar, duração, pessoas e abertura. O cartão selecionado ganha contorno laranja; seus detalhes aparecem no inspetor lateral ou na folha móvel.

### Detail inspector

No desktop, o painel permanece disponível ao lado da biblioteca. No celular, abre como uma folha inferior com passos e cronômetro, sem tirar o líder da lista.

## Do's and Don'ts

### Do:
- Colocar o próximo encontro antes de qualquer biblioteca.
- Usar o laranja sólido para foco, ação ou estado realmente ativo.
- Manter instruções de dinâmica visíveis em passos curtos e numerados.
- Usar transparência para explicar camadas, não para chamar atenção.
- Mudar a composição no celular, não somente reduzir o desktop.

### Don't:
- Usar uma hero de marketing como tela inicial da ferramenta.
- Aplicar vidro em todas as superfícies sem hierarquia.
- Transformar cada recurso em cartões idênticos.
- Esconder instruções de condução atrás de uma tela sem contexto.
