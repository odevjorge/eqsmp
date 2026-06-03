# Processamento de Minérios

A mineração no EQSMP não dá ingot direto. Cada minério dropa um **cluster sujo** com um tier de qualidade de 1 a 10 — você precisa lavar, processar e refinar pra ter o material final. Tier maior significa mais material por bloco, mas o tier que cai depende da picareta usada.

> Para quem vai manter ou estender o sistema, ver [`docs/dev/ore-processing.md`](dev/ore-processing.md).

---

## Conceitos

### Tier do cluster (1-10)

Todo cluster vem com um tier sorteado na hora da mineração. O tier influencia o quanto cada etapa rende:

| Tier | Categoria | Cor do nome |
|------|-----------|-------------|
| 1-3 | Comum | Cinza |
| 4-6 | Incomum | Verde |
| 7-9 | Raro | Azul |
| 10 | Épico | Roxo |

### Pickaxe → distribuição de tiers

A pickaxe usada enviesa a distribuição. Em média:

| Pickaxe | Tiers favorecidos | Tier médio |
|---------|-------------------|------------|
| Iron (ou wooden/stone/gold/iron) | 1-4 | ~3 |
| Diamond | 5-7 | ~6 |
| Netherite | 7-10 | ~8 |

Silent Gear é suportado: o tier de harvest do pickaxe modular conta (iron / diamond / netherite).

---

## Drops por minério

### Cluster ores — chain completa de refino

Drop: `kubejs:<metal>_cluster_<1-10>_dirty`

| Minério (Geolosys) | Metais (chance %) |
|---|---|
| **azurite** | copper 92 / gold 5 / silver 3 |
| **malachite** | copper 92 / silver 5 / nickel 3 |
| **galena** | lead 77 / silver 15 / zinc 8 |
| **sphalerite** | zinc 80 / lead 15 / copper 5 |
| **cassiterite** | tin 100 |
| **teallite** | tin 70 / lead 30 |
| **hematite** | iron 98 / copper 1 / gold 1 |
| **limonite** | iron 83 / nickel 10 / copper 5 / platinum 2 |
| **gold** | gold 85 / silver 10 / copper 5 |
| **nether_gold** | gold 100 |
| **bauxite** | aluminum 88 / iron 12 |
| **autunite** | uranium 95 / copper 5 |
| **platinum** | platinum 85 / nickel 6 / osmium 5 / copper 4 |
| **ancient_debris** | ancient_debris 100 (chain especial) |

### Pieces ores — chain curta

Drop: `kubejs:<source>_dirty` em quantidade 1-5 (escala pela pickaxe).

| Minério (Geolosys) | Recurso final |
|---|---|
| **coal** | `minecraft:coal` |
| **quartz** | `minecraft:quartz` |
| **lapis** | `minecraft:lapis_lazuli` |
| **cinnabar** | `minecraft:redstone` |
| **beryl** | `shards_and_pieces:emerald_shard` |
| **kimberlite** | `shards_and_pieces:diamond_shard` |

### Sample blocks (geolosys:*_ore_sample)

Marcadores de depósito que aparecem na superfície. Quebrar com qualquer ferramenta dropa:

- Cluster sample → 1× cluster do metal principal, tier 1, **limpo**
- Pieces sample → 1× do recurso final (sem precisar lavar)

---

## Pipeline de processamento

### Etapa 1 — Lavar (Splashing)

Toda peça suja precisa ser lavada antes de qualquer processamento:

| Entrada | Máquina | Saída |
|---|---|---|
| `<metal>_cluster_<t>_dirty` | Encased Fan + água (Create) | `<metal>_cluster_<t>` (limpo) |
| `<source>_dirty` (pieces) | Encased Fan + água | Recurso final |

### Etapa 2 — Processar o cluster limpo

Múltiplas rotas, cada uma com rendimento diferente:

| Máquina | Mod | Entrada | Saída |
|---|---|---|---|
| **Millstone** | Create | cluster limpo | 1-2× nugget + cluster do tier anterior |
| **Crushing Wheels** | Create | cluster limpo | 2-4× `crushed_raw_<metal>` + cluster do tier anterior |
| **Squeezer** | Integrated Dynamics | cluster limpo | 1× nugget |
| **Crusher** (ritual) | Occultism | cluster **sujo** (rota direta) | 2× nugget |

> **"Cluster do tier anterior"** = bypass da lavagem. Ex: processar cluster_5 te dá produto principal + cluster_4 limpo, que você pode reprocessar.

### Etapa 3 — Refino final

| Entrada | Máquina | Saída |
|---|---|---|
| `crushed_raw_<metal>` | Melter (Createmetallurgy) | 120 mB de `molten_<metal>` |
| `raw_<metal>` (vanilla) | Melter | 120 mB de molten |
| `molten_<metal>` + Graphite Ingot Mold | Casting Table | 1× ingot |
| `dust_<metal>` | Furnace / Blast Furnace | 1× ingot (rota fallback) |

### Atalhos de bancada

| Receita | Resultado |
|---|---|
| 9× nugget (shaped 3x3) | 1× `crushed_raw_<metal>` |
| 3× crushed_raw (shapeless) | 2× `dust_<metal>` |

---

## Tabela de processamento por metal

| Metal | Splashing | Occultism | Milling | Crushing | Squeezer | Melter | Casting | Dust→Ingot |
|---|---|---|---|---|---|---|---|---|
| aluminum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| copper   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| gold     | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| iron     | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| lead     | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| nickel   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| osmium   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| silver   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tin      | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| zinc     | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| platinum | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (única rota) |
| uranium  | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (única rota) |

> **Platinum e Uranium** não têm molten fluid no Createmetallurgy, então a rota de fundição em alta escala não está disponível — refino só via dust → smelt/blast.

---

## Caso especial — Ancient Debris

Mesma chain de cluster + tier, mas com destino diferente:

| Etapa | Resultado |
|---|---|
| Splashing | `ancient_debris_cluster_<t>` limpo |
| Crushing Wheels | **`ceil(tier/2)` × `netherite_scrap`** + cluster do tier anterior |
| Melter / Casting | ❌ (sem rota — não tem molten ancient_debris) |

Tier 10 = 5 scraps por cluster. Tier 1 = 1 scrap.

---

## Compatibilidade com EMI / JEI

Toda a tabela de drops é injetada via `ServerEvents.blockLootTables` (não LootJS runtime), então **EMI, JEI e Advanced Loot Info enxergam corretamente** os 240+ resultados possíveis por minério com seus pesos calculados. Clique num minério no recipe viewer pra ver a lista completa.

---

## Diagrama resumido (exemplo: azurite com picareta netherite)

```
geolosys:azurite_ore  +  Netherite Pickaxe
        │
        ▼  (loot table: 92% copper, 5% gold, 3% silver × tier 7-10 favorecido)
kubejs:copper_cluster_8_dirty
        │
        ├─► Encased Fan + água (Splashing)
        │       │
        │       ▼
        │  kubejs:copper_cluster_8 (limpo)
        │       │
        │       ├─► Millstone → 1-2× copper_nugget + cluster_7
        │       ├─► Crushing Wheels → 2-4× crushed_raw_copper + cluster_7
        │       │       │
        │       │       ▼
        │       │   Melter → molten_copper (120 mB)
        │       │       │
        │       │       ▼
        │       │   Casting Table + Graphite Ingot Mold
        │       │       │
        │       │       ▼
        │       │   minecraft:copper_ingot
        │       │
        │       └─► Squeezer → 1× copper_nugget
        │
        └─► Occultism Crusher (atalho do sujo) → 2× copper_nugget
```
