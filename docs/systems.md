# Sistemas de gameplay do EQSMP

Índice dos sistemas customizados do pack. Tudo aqui é implementado como scripts **KubeJS** versionados em `eqsmp/kubejs/` (fonte hand-authored, distribuída aos clientes pelo container packwiz). Esta página é o mapa; cada sistema linka para sua doc player-facing e/ou técnica.

> Convenção de docs: **player** descreve o que o jogador faz e por quê; **técnico** (em `docs/dev/`) descreve como o código está organizado e como estender sem quebrar nada.

## Organização do diretório KubeJS

```
eqsmp/kubejs/
├── startup_scripts/<modulo>/   # 00_config.js (global.<Nome>) + 01_items.js (registro de itens)
├── server_scripts/<modulo>/    # recipes, gates, loot, eventos de servidor
├── client_scripts/<modulo>/    # JEI/tooltip (lado cliente)
└── assets/kubejs/lang/         # en_us.json + pt_br.json
```

Cada módulo segue o mesmo padrão: um `00_config.js` publica um objeto `global.<Nome>` (catálogo + parâmetros) que os `server_scripts` leem **em runtime, dentro do callback** (a ordem de carregamento do KubeJS não é determinística). Detalhes das convenções em [dev/kubejs-modules.md](dev/kubejs-modules.md).

## Sistemas

| Sistema | O que faz | Player | Técnico |
|---|---|---|---|
| **Progressão cross-mod (F1→F4 + Pedra Filosofal)** | Espinha dorsal do pack: quatro itens-gate em sequência, cada um cruzando mods diferentes, mais o endgame que consome os quatro | [cross-mod-progression.md](cross-mod-progression.md) | [dev/cross-mod-progression.md](dev/cross-mod-progression.md) |
| **Processamento de minérios** | Substitui o raw ore por clusters sujos de 10 tiers; processamento por múltiplas rotas (Create / Createmetallurgy / Occultism) | [ore-processing.md](ore-processing.md) | [dev/ore-processing.md](dev/ore-processing.md) |
| **Gates cross-mod** | Força receitas vanilla/de mod a exigir ingredientes processados em mods adjacentes (interdependência) | — | [dev/kubejs-modules.md#cross_mod_gates](dev/kubejs-modules.md#cross_mod_gates) |
| **Dificuldade por pecado** | Karma de mortes alimenta o Scaling Health: matar pacíficos/neutros sobe a dificuldade, hostis abaixam | — | [dev/kubejs-modules.md#sin_difficulty](dev/kubejs-modules.md#sin_difficulty) |
| **Balanço de ferramentas** | Vanilla reabilitada mas fraca; modded buffada. Tooltip avisa | — | [dev/kubejs-modules.md#tool_balance](dev/kubejs-modules.md#tool_balance) |
| **Marcadores de amostra de minério** | Quebrar uma amostra de superfície Geolosys cria um landmark no mapa (Surveyor/Antique Atlas) | — | [dev/kubejs-modules.md#ore_sample_markers](dev/kubejs-modules.md#ore_sample_markers) · [SURVEYOR_API.md](../SURVEYOR_API.md) |
| **Decaimento de flores Botania** | Flores funcionais decaem com o tempo se não mantidas | — | [dev/kubejs-modules.md#botania_decay](dev/kubejs-modules.md#botania_decay) |
| **Drops de archwood (Ars)** | Folhas archwood têm chance de dropar `livingwood_twig` | — | [dev/kubejs-modules.md#ars_archwood](dev/kubejs-modules.md#ars_archwood) |
| **Bootstrap (fase 0)** | Comando `/eqsmp kit`, gates de receita iniciais (manasteel → novice spell book) | — | [dev/kubejs-modules.md#phase0_bootstrap](dev/kubejs-modules.md#phase0_bootstrap) |
| **Modificações de item** | Patches permanentes em defaults de item (ex.: chalks infinitos do Occultism) | — | [dev/kubejs-modules.md#item_modifications](dev/kubejs-modules.md#item_modifications) |
| **JEI hide** | Esconde itens intermediários (`*_dirty`) do JEI/EMI | — | [dev/kubejs-modules.md#jei_hide](dev/kubejs-modules.md#jei_hide) |

## Quests

O livro de quests (FTB Quests) vive em `eqsmp/config/ftbquests/quests/` — **23 chapters / 505 quests** em português, organizados em quatro grupos:

- **Lore** — narrativa do endgame (Pedra Filosofal, "A Quase-Extinção").
- **Fases EQSMP** — a cadeia F1→F4 + o hub "Quatro Caminhos" (`pilares`).
- **Caminhos dos Mods** — um chapter por mod (Botania, Ars Nouveau, Occultism, AE2, Create, Pam's, armazenamento, Iron's Spells, Tombstone, Waystones, Lootr).
- **Aventura** — bosses e exploração (Twilight Forest, Cataclysm, Bosses of Mass Destruction).

O livro é editado fora do jogo pelo **editor web FTB Quests** (`ftbquests/`). O workflow de edição (reload + refresh packwiz + patch de título inline) é **crítico** e está documentado no [CLAUDE.md raiz](../CLAUDE.md#ftb-quests-editing-workflow-critical). Internals do editor: [ftbquests/CLAUDE.md](../ftbquests/CLAUDE.md).

## Testes

Cada fase tem uma suite de validação em `server_scripts/zzz_dev_tests/<fase>_test.js` que roda após `/reload` e reporta PASS/FAIL lendo o `recipeManager` vivo. A skill `eqsmp-test` automatiza isso. O test do F1 também tem um wrapper shell em `tools/f1-test.sh`.
