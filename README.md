# EQSMP — Epic Questing Survival Multiplayer

Modpack Minecraft Forge 1.20.1 de **magia, tecnologia, exploração e aventura compartilhada**. Construído em torno do multiplayer: as receitas e progressões puxam **conteúdo de mods diferentes pra dentro da mesma cadeia**, então o servidor ganha quando os jogadores se especializam e dividem o trabalho — um vira o fundidor, outro o mago, outro o explorador.

- **MC:** 1.20.1
- **Loader:** Forge 47.4.20
- **Mods:** ~146 (Forge + Fabric via Sinytra Connector)
- **Distribuição:** CurseForge + Modrinth

> 🇬🇧 *A Forge 1.20.1 magic-meets-tech questing pack where no mod stands alone: recipes chain content across different mods, so you must weave magic, machinery and exploration together to reforge the legend that broke the world. Co-op friendly, with a fully bilingual (EN/PT-BR) quest book.*

---

## 🧑‍💻 Sobre o projeto · About

O EQSMP é feito por **uma pessoa só** — não existe equipe. A maior parte do conteúdo foi construída **com auxílio de IA**: os scripts, receitas, progressões, balanceamento, as **imagens e os itens customizados**, e até boa parte desta documentação. É um projeto pessoal, experimental e em constante evolução — se algo parecer estranho, provavelmente foi feito por uma pessoa e um robô de madrugada. 🙂

> 🇬🇧 *EQSMP is made by **one single person** — there is no team. Most of the content was built **with the help of AI**: the scripts, recipes, progression, balancing, the **artwork and custom items**, and even much of this documentation. It's a personal, experimental project that keeps evolving.*

---

## Os quatro pilares

- 🔮 **Magia** — Ars Nouveau, Botania, Occultism, Iron's Spells 'n Spellbooks (mana unificada). Rituais, criaturas familiares, escolas de magia, automação mágica.
- ⚙️ **Tecnologia** — Create + Createmetallurgy, Integrated Dynamics, Applied Energistics 2. Engenharia mecânica, fundição, lógica e automação industrial.
- 🗺️ **Exploração** — Geolosys (depósitos minerais realistas), biomas estendidos, dungeons e bosses de aventura (Cataclysm, Bosses of Mass Destruction, Twilight Forest).
- 🤝 **Aventura compartilhada** — quests cooperativas (FTB Quests), economia de divisão de trabalho entre mods, design pensado pra grupos.

## Cross-mod synergy

O diferencial do EQSMP é o **encadeamento entre mods**, não cada mod isolado. Exemplo prático: pra fazer um ingot de cobre você passa por Geolosys (minerar) → KubeJS (cluster de tier 1-10) → Create (lavar/moer/triturar) → Createmetallurgy (fundir/moldar) → Occultism ou Integrated Dynamics como rota alternativa. Nenhum mod sozinho fecha a cadeia.

Esse padrão se repete por todo o pack: mágica usa metais do tech, tech usa reagents da magia, exploração libera ambos.

---

## Features

Todos os sistemas de gameplay são scripts KubeJS versionados em `eqsmp/kubejs/`. Visão geral e índice completo em **[docs/systems.md](docs/systems.md)**.

### Cadeia de progressão cross-mod (F1 → F4 → Pedra Filosofal)

A espinha dorsal do pack: quatro itens-gate em sequência, cada um exigindo ingredientes processados em **mods diferentes**, mais um endgame que consome os quatro.

- **F1 — Aglutinado Mágico:** compactação (Create) → infusão de mana (Botania). Destrava `mana_pool`, `andesite_alloy` e o foliot do Occultism.
- **F2 — Núcleo Cinético:** mechanical crafter (Create) → ritual foliot (Occultism). Destrava `runic_altar` (Botania) e `enchanting_apparatus` (Ars).
- **F3 — Cristal de Mana Pura:** runic altar (Botania) → imbuement chamber (Ars). Destrava o djinni (Occultism) e o `mechanical_arm` (Create).
- **F4 — Núcleo Espiritual:** sequenced assembly (Create) que consome F1+F2+F3. Destrava `terrasteel` (Botania) e `ritual_brazier` (Ars).
- **Pedra Filosofal (endgame):** ritual djinni de 10 min que consome F1+F2+F3+F4 + nether star.

→ Player: **[docs/cross-mod-progression.md](docs/cross-mod-progression.md)** · Técnico: **[docs/dev/cross-mod-progression.md](docs/dev/cross-mod-progression.md)**

### Sistema de Processamento de Minérios

Substitui o drop direto de raw ore por uma cadeia de processamento com **10 tiers de qualidade** sorteados na hora da mineração — tier maior = mais material, mas só cai com pickaxe melhor.

- 13 minérios Geolosys com tabela de drop probabilística (1-4 metais por minério)
- 6 "pieces ores" com escala de quantidade por tier de pickaxe (1-5 unidades)
- Múltiplas rotas de processamento (Create, Createmetallurgy, Occultism, Integrated Dynamics)
- Cluster sujo → lavar → moer/triturar/espremer → ingot
- Drops totalmente compatíveis com EMI / JEI / Advanced Loot Info

→ Player: **[docs/ore-processing.md](docs/ore-processing.md)** · Técnico: **[docs/dev/ore-processing.md](docs/dev/ore-processing.md)**

### Outros sistemas

- **Dificuldade por pecado** — matar mobs pacíficos/neutros sobe a dificuldade do Scaling Health; matar hostis abaixa. Magnitude por média-móvel (momentum).
- **Marcadores de amostra de minério** — quebrar uma amostra de superfície Geolosys cria um landmark no mapa (Surveyor/Antique Atlas) com ícone e nome do minério.
- **Balanço de ferramentas** — ferramentas vanilla reabilitadas mas fracas; armas modded buffadas. Tooltip avisa o jogador.
- **Decaimento de flores Botania**, **drops de archwood (Ars)**, **gates cross-mod** que forçam interdependência entre Create/Botania/Ars/Occultism, e mais.

→ Referência técnica de todos os módulos: **[docs/dev/kubejs-modules.md](docs/dev/kubejs-modules.md)**

### Quests (FTB Quests)

Livro de quests **100% bilíngue (português + inglês)** com **23 chapters / 505+ quests** organizados em quatro grupos: Lore, Fases EQSMP (F1→F4 + hub), Caminhos dos Mods (um chapter por mod), e Aventura (bosses e exploração). O jogo escolhe o idioma automaticamente.

---

## Mods principais

- **Create** + **Createmetallurgy** — automação industrial e fundição de metais
- **Geolosys** — geração realista de depósitos minerais
- **Silent Gear** — ferramentas e armas modulares
- **All The Ores** — uniformização de metais entre mods
- **Ars Nouveau** — magia
- **Botania** — magia natural
- **Occultism** — magia ritual + processamento alternativo
- **Iron's Spells 'n Spellbooks** (+ ponte Ars'n'Spells) — escolas de magia e bosses; mana unificada com a do Ars
- **Integrated Dynamics** — lógica e automação
- **KubeJS** — scripts customizados (cadeia cross-mod, minérios, balanço)
- **FTB Quests** — guia de progressão in-game

O pack roda ~146 mods (Forge + Fabric via **Sinytra Connector**). Lista completa em [`pack/mods/`](pack/mods/).

---

## Instalação (cliente)

### CurseForge / Modrinth (recomendado)

Procure por **EQSMP** no launcher do CurseForge ou no Modrinth App e instale — o launcher cuida de baixar todos os mods e dependências.

### Prism Launcher / MultiMC

Importe o pacote exportado (`.mrpack` do Modrinth ou o `.zip` do CurseForge) em **Add Instance → Import**.

---

## Estrutura do repositório

Este repositório contém o **conteúdo do modpack** (fontes packwiz + scripts/configs customizados). Os `.jar` dos mods **não** são versionados — o packwiz os baixa das fontes oficiais (CurseForge / Modrinth) na instalação.

```
pack/                        # source autoritativo do modpack (packwiz)
  pack.toml, index.toml
  mods/*.pw.toml             # ~146 mods (Modrinth + CurseForge)
  shaderpacks/               # shaderpack distribuída (Allium)
  spawn_bubble/              # region files da cidade inicial (Lost City)

eqsmp/                       # conteúdo hand-authored distribuído pelo pack
  kubejs/                    # scripts customizados
    startup_scripts/         # config global + registro de itens, por módulo
    server_scripts/          # recipes, gates, loot, eventos, por módulo
    client_scripts/          # jei_hide, tooltips
    assets/kubejs/lang/      # en_us.json + pt_br.json
  config/ftbquests/quests/   # livro de quests (23 chapters, bilíngue)
    lang/                    # en_us.snbt (inglês) + pt_br.snbt (português)
    reward_tables/           # loot tables das recompensas aleatórias
  config/                    # configs dos mods
  scripts/                   # scripts CraftTweaker (.zs)

icon/                        # arte do ícone do pack (512→32) + master
docs/                        # documentação (player + dev)
SURVEYOR_API.md              # API Surveyor (mapas) sob Sinytra Connector
DESCRIPTION.md               # descrição pública (CurseForge/Modrinth), bilíngue
```

---

## 🤝 Contribuições · Contributing

Contribuições seriam **maravilhosas**! Por ser um projeto de uma pessoa só, qualquer ajuda agrega muito. Sinta-se livre para:

- Fazer **fork** do repositório;
- Propor correções, melhorias e **adições que somem ao conteúdo** do modpack — novos sistemas, quests, traduções, balanceamento, arte;
- Abrir issues/PRs com ideias ou bugs.

A ideia é deixar o pack crescer com a comunidade. Mudanças que **agregam** ao conteúdo são bem-vindas.

> 🇬🇧 *Contributions would be **wonderful**! Since this is a one-person project, any help goes a long way. Feel free to **fork it**, fix it, and propose anything that **adds to the pack's content** — new systems, quests, translations, balance, art. Open issues/PRs with ideas or bugs. The goal is to let it grow beyond what one person and a robot can do alone.*

---

## Licença · License

Os **scripts, configs e conteúdo original** deste modpack (KubeJS, quests, arte) são de **ODEVJORGE**. Você está livre para **forkar, modificar e contribuir** — se redistribuir uma versão modificada, mantenha o crédito ao projeto original. Os **mods incluídos** pertencem aos seus respectivos autores e seguem suas próprias licenças.

> 🇬🇧 *The original scripts, configs and content (KubeJS, quests, art) are by **ODEVJORGE**. You're free to **fork, modify and contribute** — if you redistribute a modified version, please keep credit to the original project. Bundled mods belong to their respective authors under their own licenses.*
