# Cross-mod progression — referência técnica

> Doc de manutenção. Versão player-facing: [../cross-mod-progression.md](../cross-mod-progression.md).
>
> **Os arquivos-fonte são a verdade.** Esta doc descreve a arquitetura, o fluxo de receitas e as convenções. Para constantes exatas (custos de mana, durações de ritual, contagens), leia o arquivo citado — números são propositalmente deixados no código para não envelhecerem aqui.

## Visão geral

Cinco módulos KubeJS implementam a cadeia. Cada um vive em duas árvores:

- `startup_scripts/<modulo>/` — `00_config.js` (publica `global.<Nome>`) + `01_items.js` (registra os itens custom via `StartupEvents.registry('item', ...)`).
- `server_scripts/<modulo>/` — recipes de produção + arquivo de **gates** que torna o item obrigatório em receitas de outros mods.

Todos os itens custom estão no namespace `kubejs:`. Os pares precursor→final:

| Fase | Precursor (amaldiçoado) | Item final | Módulo |
|---|---|---|---|
| F1 | `kubejs:cursed_aglutinado_magico` | `kubejs:aglutinado_magico` | `aglutinado_magico` |
| F2 | `kubejs:cursed_nucleo_cinetico` | `kubejs:nucleo_cinetico` | `nucleo_cinetico` |
| F3 | `kubejs:cursed_cristal_mana_pura` | `kubejs:cristal_mana_pura` | `cristal_mana_pura` |
| F4 | `kubejs:cursed_nucleo_espiritual` | `kubejs:nucleo_espiritual` | `nucleo_espiritual` |
| Endgame | — | `kubejs:pedra_filosofal` | `pedra_filosofal` |

## F1 — Aglutinado Mágico (`*/aglutinado_magico/`)

| Arquivo | Papel |
|---|---|
| `server_scripts/.../01_compaction.js` | Chain bidirecional de compactação X9 de sourceberry: `9× sourceberry → sack_x1 → … → sack_x9` e a decompactação reversa. Itens `kubejs:sourceberry_sack_x1..x9`. |
| `server_scripts/.../02_squeezer.js` | Override do squeezer (sem ferro — evita ciclo Create↔ore) e o processamento `sack_x1 → cursed_aglutinado_magico` em **3 tiers** (millstone → crushing wheels → squeezer; filosofia "ineficiente→upgrade"). |
| `server_scripts/.../03_infusion.js` | Passo Botania final: jogar `cursed_aglutinado_magico` na `botania:mana_pool` consome mana → `aglutinado_magico`. |
| `server_scripts/.../04_gates.js` | Consumers: força `create:andesite_alloy`, as mana pools da Botania e o `occultism:book_of_binding_foliot` a exigir aglutinado. |

Gate de apothecary + remoção de worldgen estão envolvidos no setup do F1 (ver `00_config.js` e o test). Suite: `zzz_dev_tests/aglutinado_magico_test.js`.

## F2 — Núcleo Cinético (`*/nucleo_cinetico/`)

| Arquivo | Papel |
|---|---|
| `01_mechanical_crafter.js` | `brass + andesite_alloy + precision_mechanism` no mechanical crafter 3×3 → `cursed_nucleo_cinetico`. Herda o F1 transitivamente via `andesite_alloy` (que o gate do F1 já tornou dependente do aglutinado). |
| `02_ritual.js` | Ritual foliot do Occultism que consome `cursed_nucleo_cinetico` + 4 ingredientes (1 por mod) → `nucleo_cinetico`. |
| `03_gates.js` | Gateia o bloco `botania:runic_altar` e o `ars_nouveau:enchanting_apparatus` (afeta ~50 recipes do apparatus). |

Suite: `zzz_dev_tests/nucleo_cinetico_test.js`.

## F3 — Cristal de Mana Pura (`*/cristal_mana_pura/`)

| Arquivo | Papel |
|---|---|
| `01_runic_altar.js` | `mana_pearl + mana_diamond + nucleo_cinetico` (+extras) no runic altar → `cursed_cristal_mana_pura`. |
| `02_imbuement.js` | `ars_nouveau:imbuement_chamber` + 4 pedestais (1 por mod) + source → `cristal_mana_pura` (refinamento final). |
| `03_gates.js` | Gateia `occultism:book_of_binding_djinni` e o `create:mechanical_arm` (substitui o precision mechanism por cristal). |

Suite: `zzz_dev_tests/cristal_mana_pura_test.js`.

## F4 — Núcleo Espiritual (`*/nucleo_espiritual/`)

| Arquivo | Papel |
|---|---|
| `01_sequenced_assembly.js` | `occultism:soul_gem` no depot da Create; a sequência faz deploy de F1+F2+F3 (1 loop = 3 deploys) → `nucleo_espiritual`. **Primeiro item que consome a cadeia inteira.** |
| `02_gates.js` | **Adiciona** (não substitui) `nucleo_espiritual` ao `botania:terrasteel_ingot` e ao `ars_nouveau:ritual_brazier` — mantém os ingredientes vanilla. |

Suite: `zzz_dev_tests/nucleo_espiritual_test.js`.

## Endgame — Pedra Filosofal (`*/pedra_filosofal/`)

`server_scripts/pedra_filosofal/01_ritual.js` — ritual de djinni do Occultism (pentacle gateado pelo F3, longa duração) consome **F1 + F2 + F3 + F4 + `minecraft:nether_star`** → `kubejs:pedra_filosofal`. Agrega todo o progresso do servidor.

Suite: `zzz_dev_tests/pedra_filosofal_test.js`. O chapter de lore "A Ambição" foi adaptado do projeto antigo.

## Convenções que valem a cadeia inteira

- **DSL de recipe quebrada → `event.custom({...})` com JSON puro.** Create 6.x e Botania 1.20.1 quebraram a DSL do KubeJS (`Constructor not found`). Os arquivos de recipe usam `event.custom()` com o JSON cru da recipe. Não tente "consertar" para a DSL.
- **Loot via `ServerEvents.blockLootTables`, nunca LootJS.** Modificações runtime do LootJS são invisíveis a EMI/JEI/Advanced Loot Info.
- **Config lida dentro do callback.** A ordem de carregamento do KubeJS é não-determinística: `01_*.js` pode carregar antes de `00_config.js`. Registre o handler incondicionalmente e leia `global.<Nome>` *dentro* do callback (`const C = global.X; if (!C) return;`), nunca no topo do módulo.
- **Numeração de arquivos = ordem.** `00_config` → `01_items` → `01..04_*` (lógica). `zzz_dev_tests` é prefixado para carregar por último.
- **Gates são aditivos por design no F4+**, substitutivos no F1–F3. Cuidado ao mexer: trocar um gate substitutivo por aditivo (ou vice-versa) muda o balanceamento da cadeia inteira.

## Como testar uma mudança

Depois de editar qualquer arquivo da cadeia:

No console do servidor (ou via RCON):

```
/ftbquests reload          # se mexeu em quest
/kubejs reload server_scripts
```

As suites em `zzz_dev_tests/` rodam automaticamente após `/reload` e logam PASS/FAIL lendo o `recipeManager` vivo (não `findRecipes` pré-modificação). A skill `eqsmp-test` orquestra isso. Lembre de `packwiz refresh` se a mudança afeta arquivos distribuídos (ver [CLAUDE.md raiz](../../CLAUDE.md#ftb-quests-editing-workflow-critical)).
