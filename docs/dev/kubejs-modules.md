# Módulos KubeJS — referência técnica

> Catálogo dos módulos KubeJS do EQSMP que não fazem parte da cadeia cross-mod (essa tem doc própria: [cross-mod-progression.md](cross-mod-progression.md)) nem do processamento de minérios ([ore-processing.md](ore-processing.md)).
>
> Os arquivos-fonte são a verdade — esta doc descreve papel, estrutura e gotchas. Constantes exatas ficam no código.

## Convenções comuns a todos os módulos

- **Estrutura por módulo:** `startup_scripts/<mod>/00_config.js` publica `global.<Nome>` (catálogo + parâmetros); `server_scripts/<mod>/*.js` lê esse global **dentro do callback** e registra a lógica. `client_scripts/<mod>/` para JEI/tooltip.
- **Ordem de carregamento não-determinística.** Registre handlers incondicionalmente; leia `global.<Nome>` dentro do callback (`const C = global.X; if (!C) return;`), nunca no topo do arquivo. Numeração (`00_`, `01_`…) garante ordem só *dentro* de um módulo, não entre módulos.
- **Loot:** `ServerEvents.blockLootTables`, não LootJS (modificações runtime do LootJS são invisíveis a EMI/JEI/Advanced Loot Info). Use `addPool` sem `clearPools` quando quiser preservar drops originais.
- **Recipes:** `event.custom({...})` com JSON puro para Create 6.x / Botania 1.20.1 (a DSL do KubeJS quebrou nesses).
- **Iteração de dimensões:** `server.allLevels` (não `server.levels` — o Rhino expõe o getter Java como property).
- **APIs não expostas:** `Java.loadClass(...)` (ex.: Surveyor sob Sinytra Connector, com remap Yarn→Mojmap).
- **Texto pro jogador:** português, via `assets/kubejs/lang/pt_br.json`. `en_us.json` cobre só o mínimo.

---

## cross_mod_gates

Força interdependência entre Create / Botania / Ars / Occultism / vanilla.

- `server_scripts/cross_mod_gates/01_recipes.js` — ~14 recipes que reescrevem itens-chave (goggles, dominion_wand, amethyst_block, source_fluid via mixing, mana_pylon, etc.) para exigir ingredientes de mods adjacentes, via `event.custom()`.
- `server_scripts/cross_mod_gates/03_wood_overhaul.js` — força recipes a usar twigs mágicos (Botania/Ars/Occultism) no lugar do stick vanilla, via tag agregadora.
- `server_scripts/cross_mod_gates/04_geolosys_bonus_drops.js` — bonus drops de exclusivos Alltheores (iridium/osmium/ruby/sapphire/peridot/emerald) em minérios Geolosys, baseado em mineralogia real.
- `startup_scripts/cross_mod_gates/01_items.js` — itens de suporte.

## sin_difficulty

Karma de mortes alimenta a dificuldade do **Scaling Health**.

- `startup_scripts/sin_difficulty/00_config.js` — `global.SinDifficulty` (classificação de mobs, magnitudes).
- `server_scripts/sin_difficulty/00_config.js` + `01_kill.js` — em cada kill por player: matar mob **pacífico/neutro** = pecado (sobe dificuldade); matar **hostil** = penitência (abaixa). A magnitude usa média-móvel (momentum) entre o kill atual e o anterior, então sprees pesam diferente de kills isolados.

## tool_balance

Reabilita ferramentas vanilla mas fracas; buffa as modded. (Substituiu o sistema antigo de *desabilitar* vanilla — ver memória `project_disable_vanilla_tools`.)

- `startup_scripts/tool_balance/{00_config.js,01_durability.js}` — `global.ToolBalance` (lista de ferramentas vanilla + mensagens) e ajuste de durabilidade vanilla.
- `server_scripts/tool_balance/01_damage.js` — em todo dano por player, escala: ferramenta vanilla × multiplicador fraco, arma modded × multiplicador forte (creative/spectator ignorados).
- `client_scripts/tool_balance/01_tooltip.js` — `ItemEvents.tooltip` adiciona aviso "fraco" + hint nas ferramentas vanilla listadas.

## ore_sample_markers

Quebrar uma amostra de superfície Geolosys cria um landmark no mapa (Surveyor / Antique Atlas 4, sob Sinytra Connector) com ícone e nome do minério.

- `server_scripts/ore_sample_markers/00_config.js` — namespace, flags (`requireSky`, `ownerMode`, feedback).
- `server_scripts/ore_sample_markers/01_break.js` — usa `Java.loadClass` para a API do Surveyor. Detalhes da API em [SURVEYOR_API.md](../../SURVEYOR_API.md).

## botania_decay

Flores funcionais da Botania decaem com o tempo.

- `startup_scripts/botania_decay/00_config.js` — `global.BotaniaDecay` (lista de flores, TTL).
- `server_scripts/botania_decay/01_decay.js` — `BlockEvents.placed` registra `deathTick`; `broken` desregistra; `ServerEvents.tick` varre **cada level** (`server.allLevels`, multi-dim) matando flores expiradas. Inclui limpeza de entradas órfãs.

## ars_archwood

- `server_scripts/ars_archwood/01_drops.js` — adiciona um pool de chance para `ars_nouveau:livingwood_twig` (~2%) nas 4 folhas archwood, via `ServerEvents.blockLootTables` com `addPool` (preserva os drops originais).
- `startup_scripts/ars_archwood/00_config.js` — parâmetros.

## phase0_bootstrap

Onboarding inicial do servidor.

- `server_scripts/phase0_bootstrap/01_starting_kit.js` — placeholder (auto-give foi removido em 2026-05-24).
- `server_scripts/phase0_bootstrap/02_recipe_gates.js` — regateia `ars_nouveau:novice_spell_book` para exigir as 4 ferramentas de manasteel (manasteel = primeiro upgrade da fase 0).
- `server_scripts/phase0_bootstrap/03_kit_command.js` — registra `/eqsmp kit <mod|list>`, concede o stage `eqsmp_phase0` na primeira execução por player.

## item_modifications

- `startup_scripts/item_modifications/00_modifications.js` — `ItemEvents.modification` para patches **permanentes** nos defaults de itens (ex.: chalks do Occultism viram infinitos, ajustes de durabilidade). Afeta toda instância do item, não NBT runtime. (Migrado em 2026-05-24, corrigindo um bug de regex do original.)

## jei_hide

- `client_scripts/jei_hide/00_hide.js` — esconde do JEI/EMI os itens intermediários `*_cluster_*_dirty` / `*_piece_dirty` do ore processing (~136 itens). Corrige um bug de regex do sistema antigo.

> Nota EMI: o EMI 1.1.24 **não** tem feature de collapse; para esconder duplicados do *index* usa-se `data/<ns>/emi/index/stacks/*.json` com `removed`, não o JEI hide (ver memória `feedback_emi_no_collapse_in_1_1`).

---

## Legado (`eqsmp/kubejs-old/`)

`kubejs-old/` **não é carregado** — o servidor lê só `eqsmp/kubejs/`. Contém o sistema antigo (`geolosys_*`, `lore_items.js`, `hide_items.js`, `cursed_vanilla_tools_tooltip.js`) que foi reescrito nos módulos atuais. Os "lore items/recipes" antigos **não** foram portados (decisão de greenfield/redesign futuro — ver memória `project_lore_items_status`). Pode ser apagado quando o redesign de lore items começar.
