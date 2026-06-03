# Progressão cross-mod — As Quatro Fases e a Pedra Filosofal

> Doc player-facing. Para a implementação (arquivos, recipes exatas, gates), veja [dev/cross-mod-progression.md](dev/cross-mod-progression.md).

A espinha dorsal do EQSMP não é nenhum mod isolado — é uma **cadeia de quatro itens-chave** que você fabrica em sequência, cada um exigindo que você toque em **vários mods diferentes**. Você não consegue avançar só com Create, ou só com Botania: cada fase te empurra para o próximo sistema mágico ou técnico. No fim, um endgame consome as quatro fases de uma vez.

Essa é a tese de design do pack: **cada mod depende de outro**. Em multiplayer isso vira divisão de trabalho — um jogador domina o Create, outro a Botania, outro o Occultism, e juntos vocês destravam o que ninguém destrava sozinho.

## A ideia do item "amaldiçoado"

Cada fase produz primeiro um precursor **Amaldiçoado** (`Aglutinado Mágico Amaldiçoado`, `Núcleo Cinético Amaldiçoado`, etc.) — uma versão instável e crua. Para purificá-lo no item final, você precisa de um passo mágico de outro mod (uma infusão de mana, um ritual, uma câmara de imbuimento). O "amaldiçoado" é o gancho narrativo de que magia bruta precisa de refino.

## As quatro fases

### F1 — Aglutinado Mágico

O ponto de partida. Você comprime **sourceberries** (Ars Nouveau) em sacos cada vez mais densos via Create, processa o resultado numa rota deliberadamente ineficiente (moinho → rodas de trituração → squeezer — cada upgrade melhora o rendimento), e finalmente joga o precursor amaldiçoado numa **mana pool** da Botania para purificá-lo.

**Destrava:** `andesite_alloy` (Create), a `mana_pool` / `diluted_pool` (Botania) e o `book_of_binding (foliot)` (Occultism) passam a exigir Aglutinado Mágico. É o gate que abre o resto da cadeia.

### F2 — Núcleo Cinético

Agora que você tem Create + Botania + Occultism básicos, combina-os: monta o precursor no **mechanical crafter** da Create (com brass + andesite alloy + precision mechanism — que já carrega o F1 dentro dele), depois consagra num **ritual de foliot** do Occultism com um ingrediente de cada mod.

**Destrava:** o `runic_altar` (Botania) e o `enchanting_apparatus` (Ars Nouveau) — dois dos blocos de crafting mágico mais importantes do jogo.

### F3 — Cristal de Mana Pura

Com o runic altar destravado, você o usa: combina pérola de mana + diamante de mana + Núcleo Cinético no **runic altar** (Botania), depois refina o resultado na **imbuement chamber** (Ars Nouveau) cercada de pedestais, gastando source.

**Destrava:** o `book_of_binding (djinni)` (Occultism, o espírito de tier mais alto) e o `mechanical_arm` (Create).

### F4 — Núcleo Espiritual

A fase de convergência. Você usa **sequenced assembly** da Create sobre uma `soul_gem` do Occultism, e a sequência **consome F1 + F2 + F3** de uma vez. É o primeiro item que exige que você tenha completado toda a cadeia anterior.

**Destrava:** adiciona o Núcleo Espiritual como ingrediente do `terrasteel` (Botania) e do `ritual_brazier` (Ars Nouveau) — sem remover os ingredientes vanilla, então é um custo extra, não uma substituição.

## Endgame — A Pedra Filosofal

O verdadeiro fim de jogo. Um **ritual de djinni** do Occultism (pentacle gateado pelo F3, ~10 minutos de duração) consome **F1 + F2 + F3 + F4 + uma Nether Star**. A Pedra Filosofal agrega literalmente todo o progresso do servidor num único item.

A lore que acompanha ("A Utopia Perdida" / "A Ambição") está no grupo de chapters **Lore** do livro de quests.

## Como isso aparece nas quests

O grupo **Fases EQSMP** do livro de quests guia você por F1→F4 com um chapter dedicado a cada fase, mais o hub `pilares` ("O Amuleto Testemunho" / "Quatro Caminhos") que dá a visão geral dos quatro caminhos. As quests apontam exatamente quais ingredientes e blocos cada fase exige.
