# Ore Processing — Documentação Técnica

Documento técnico do sistema de processamento de minérios. Para a visão do jogador, ver [`docs/ore-processing.md`](../ore-processing.md).

Alvo desta doc: quem vai **manter, estender ou debugar** o módulo — gente entrando no `eqsmp/kubejs/`.

---

## 1. Estrutura do módulo

```
eqsmp/kubejs/
├── startup_scripts/ore_processing/
│   ├── 00_config.js      # Catálogo, pesos, helpers, índice reverso
│   └── 01_items.js       # Registry de 246 itens
└── server_scripts/ore_processing/
    ├── 02_drops.js       # Loot tables (ServerEvents.blockLootTables)
    └── 03_recipes.js     # Receitas de processamento
```

**Ordem de execução:** alfabética dentro de cada pasta. O prefixo numérico (`00_`, `01_`, `02_`, `03_`) garante que `global.OreProcessing` (definido em `00_config.js`) esteja pronto antes que `01_items.js` o leia, e assim por diante.

**Por que `startup` vs `server`:**
- `startup_scripts/` rodam em **ambos** os lados (cliente + servidor) e são onde itens, blocos, fluidos, tags se registram. Catálogo + itens precisam estar aqui pra cliente reconhecer.
- `server_scripts/` rodam só no servidor e são onde loot tables, receitas, eventos de jogador entram.

---

## 2. Padrões obrigatórios para Rhino/KubeJS

KubeJS no Forge 1.20.1 usa **Rhino** como engine JS, com um shim quase-ES6. Quatro pegadinhas que afetam todo arquivo do módulo:

### 2.1. IIFE para isolar consts

Rhino compartilha escopo entre scripts do mesmo tipo (`startup_scripts/`, `server_scripts/`). Declarar `const OP` em dois arquivos diferentes do mesmo pool causa "redeclaration error". Wrapper tudo num IIFE:

```js
;(function() {
  const OP = global.OreProcessing
  // ... resto do arquivo
})()
```

### 2.2. `const`/`let` em for-loops é function-scoped, não block-scoped

Diferente de ES6 padrão. Cada iteração "redeclara" a mesma variável → erro de redeclaration **ou pior**, valor cacheado da primeira iteração. Workaround: corpo do loop dentro de uma função wrapper que cria escopo per-iteração:

```js
// ❌ ERRADO — quebra com erro silencioso ou cache
for (let t = 1; t <= 10; t++) {
  const id = 'kubejs:item_' + t   // pode ser cacheado
  event.create(id)
}

// ✅ CERTO — IIFE inline
for (var t = 1; t <= 10; t++) {
  (function(t) {
    var id = 'kubejs:item_' + t
    event.create(id)
  })(t)
}
```

### 2.3. Concatenação de string em function expression cacheia

```js
// ❌ ERRADO — Rhino otimiza e retorna valor da primeira chamada
OP.kjsCluster = function(metal, tier) { return 'kubejs:' + metal + '_cluster_' + tier }

// ✅ CERTO — Array.join evita o caching
OP.kjsCluster = function(metal, tier) { return ['kubejs:', metal, '_cluster_', tier].join('') }
```

### 2.4. `any_of` em loot tables não serializa

`minecraft:any_of` (combinar condições com OR) falha silenciosamente — o JSON resultante não tem o campo `terms`. Workaround: **um pool por condição**, não uma condição combinada.

```js
// ❌ ERRADO
{
  condition: 'minecraft:any_of',
  terms: [vanillaToolCondition('iron'), sgearToolCondition('iron')]
}

// ✅ CERTO — duas pools independentes; só uma matcha por vez
table.addPool(pool => { pool.addCondition(vanillaToolCondition('iron')); ... })
table.addPool(pool => { pool.addCondition(sgearToolCondition('iron')); ... })
```

---

## 3. `global.OreProcessing` — referência do data model

Tudo definido em `00_config.js`. Outros arquivos acessam via `const OP = global.OreProcessing`.

### 3.1. Constantes

| Nome | Tipo | Valor / formato |
|---|---|---|
| `OP.CLUSTER_TIERS` | int | `10` (número de tiers de cluster) |
| `OP.METALS` | string[] | 13 metais incluindo `ancient_debris` |
| `OP.TIER_WEIGHTS[pickaxe]` | int[10] | Pesos relativos por tier dado o tier da picareta |
| `OP.PIECES_TIER_WEIGHTS[pickaxe]` | int[5] | Pesos pra count 1-5 de pieces dado o tier da picareta |

### 3.2. Catálogos

```js
OP.cluster_ores = {
  azurite: {
    drops: { copper: 92, gold: 5, silver: 3 },  // soma deve ser 100
    blocks: ['geolosys:azurite_ore', ...]       // opcional; senão deriva
  },
  // ... 12 entradas mais
}

OP.pieces_ores = {
  coal: { resource: 'minecraft:coal' },
  // ... 5 entradas mais
}

OP.special_ores = {}  // vazio hoje
```

### 3.3. Helpers de convenção de ID

| Helper | Retorna |
|---|---|
| `OP.oreBlocks(source, override?)` | `['geolosys:<source>_ore', 'geolosys:deepslate_<source>_ore']` ou `override` |
| `OP.oreSample(source)` | `'geolosys:<source>_ore_sample'` |
| `OP.metalNugget(metal)` | `minecraft:<metal>_nugget` (iron/gold) ou `alltheores:<metal>_nugget` |
| `OP.metalIngot(metal)` | vanilla pra iron/gold/copper; `alltheores:<metal>_ingot` no resto |
| `OP.metalMolten(metal)` | `createmetallurgy:molten_<metal>` |
| `OP.metalCrushed(metal)` | `create:crushed_raw_<metal>` (todos os metais) |
| `OP.metalRaw(metal)` | `minecraft:raw_<metal>` pra iron/gold/copper, `null` pro resto |
| `OP.metalDust(metal)` | `alltheores:<metal>_dust` |
| `OP.kjsCluster(metal, tier)` | `kubejs:<metal>_cluster_<tier>` |
| `OP.kjsClusterDirty(metal, tier)` | `kubejs:<metal>_cluster_<tier>_dirty` |
| `OP.kjsPieceDirty(source)` | `kubejs:<source>_dirty` |

### 3.4. Sorteios (usados em runtime, não em scripts de registro)

| Função | Uso |
|---|---|
| `OP.rollClusterTier(pickaxeTier)` | Retorna 1-10, ponderado por `TIER_WEIGHTS` |
| `OP.rollPiecesCount(pickaxeTier)` | Retorna 1-5, ponderado por `PIECES_TIER_WEIGHTS` |
| `OP.rollClusterMetal(sourceName)` | Retorna metal-key, ponderado por `cluster_ores.drops` |
| `OP.primaryMetal(sourceName)` | Retorna metal com maior chance (usado em samples) |

> **Nota:** `rollClusterTier` e `rollClusterMetal` **não** são chamados nas loot tables atuais (substituídos por pools estáticos pesados). Ficam expostos pra uso futuro (ex.: comandos KubeJS, eventos custom).

### 3.5. Índice reverso

```js
OP.blockToSource = {
  'geolosys:azurite_ore':           { kind: 'cluster',        source: 'azurite' },
  'geolosys:deepslate_azurite_ore': { kind: 'cluster',        source: 'azurite' },
  'geolosys:azurite_ore_sample':    { kind: 'cluster_sample', source: 'azurite' },
  'geolosys:coal_ore':              { kind: 'pieces',         source: 'coal' },
  // ...
}
```

`kind` ∈ `'cluster' | 'cluster_sample' | 'pieces' | 'pieces_sample' | 'special'`. Construído em `00_config.js` iterando os 3 catálogos.

### 3.6. Validação

`00_config.js` faz um sanity check: soma das `drops` de cada `cluster_ore` deve ser 100. Emite `console.warn` se não.

---

## 4. Item registry — `01_items.js`

### 4.1. Inventário gerado

| Categoria | Count |
|---|---|
| `kubejs:<metal>_cluster_<1..10>` (limpo) | 13 × 10 = 130 |
| `kubejs:<metal>_cluster_<1..10>_dirty` | 13 × 10 = 130 |
| `kubejs:<source>_dirty` (pieces) | 6 |
| **Total** | **266** |

> A doc do player fala em 246 — diferença é que o ancient_debris dos 13 metais às vezes não é contado. O número real registrado é 266.

### 4.2. Tags

| Tag | Aplicada em |
|---|---|
| `kubejs:ore_processing` | Todos os itens do sistema |
| `kubejs:cluster` | Cluster limpo (130 itens) |
| `kubejs:cluster/<metal>` | Cluster limpo do metal específico |
| `kubejs:cluster_dirty` | Cluster sujo (130 itens) |
| `kubejs:cluster_dirty/<metal>` | Cluster sujo do metal específico |
| `kubejs:piece_dirty` | Piece sujo (6 itens) |
| `kubejs:piece_dirty/<source>` | Piece sujo do source específico |

Useful pra receitas que querem aceitar qualquer tier (`#kubejs:cluster/copper`).

### 4.3. Visual

- **Textura base** dos clusters: `geolosys:item/<metal>_cluster`.
- **Versão dirty:** mesma textura, com `color(0, 0x4B3621)` (brown-escuro) aplicada na layer 0 — efeito de "sujeira" sem texturas separadas.
- **Pieces dirty:** textura do recurso final (ex: `minecraft:item/coal`), também com tint brown-escuro.
- **Nome formatado por tier:** cinza (1-3), verde (4-6), azul (7-9), roxo (10) — controlado por `tierStyle()`.

---

## 5. Loot tables — `02_drops.js`

### 5.1. Por que `ServerEvents.blockLootTables` e não `LootJS.modifiers`

Decidido após primeiro protótipo com LootJS. Razão: **LootJS aplica modifiers em runtime** via callback `.apply(ctx => ...)`. Esse callback não aparece no JSON sincronizado pro cliente. Resultado: EMI/JEI/Advanced Loot Info não enxergam nada.

`ServerEvents.blockLootTables` reescreve o JSON da loot table real, que vira parte do datapack sincronizado server→client por mecanismo vanilla. Viewers leem normal.

**LootJS foi removido do pack** para evitar conflito de duas APIs mexendo nas mesmas tabelas. Ver memória `feedback_loot_display.md`.

### 5.2. Estrutura de pools

Pra cada bloco em `OP.blockToSource`:

1. `table.clearPools()` — remove drops vanilla (raw_X, etc.)
2. Pra cada tier de pickaxe (`iron`, `diamond`, `netherite`):
   - 1 pool com `vanillaToolCondition(tier)`
   - 1 pool com `sgearToolCondition(tier)`

Total por bloco cluster: **6 pools independentes**. Só um matcha por vez (player segura uma tool só), sem double-drop.

### 5.3. Detecção de pickaxe

**Vanilla:**
```js
{
  condition: 'minecraft:match_tool',
  predicate: { items: ['minecraft:wooden_pickaxe', 'minecraft:iron_pickaxe', ...] }
}
```

**Silent Gear** — item é `silentgear:pickaxe` (não `modular_pickaxe`!), e o tier vai por NBT path:
```js
{
  condition: 'minecraft:match_tool',
  predicate: {
    items: ['silentgear:pickaxe'],
    nbt: '{SGear_Data:{Properties:{HarvestTier:"minecraft:iron"}}}'
  }
}
```

> Outras pickaxes modded (TConstruct, etc.) **não** estão cobertas. Adicionar = mais uma condition + mais um pool por tier.

### 5.4. Cálculo de pesos

Pra cluster ores, peso final por entry:
```
weight = ore.drops[metal] × OP.TIER_WEIGHTS[pickaxeTier][clusterTier - 1]
```

Exemplo (azurite com netherite pickaxe, copper tier 7):
```
weight = 92 × 23 = 2116
```

EMI mostra esse número diretamente.

Pra pieces ores, peso vem direto de `PIECES_TIER_WEIGHTS[pickaxeTier][count - 1]`.

### 5.5. Casos especiais

- `cluster_sample` → pool fixo com 1× `kjsCluster(primaryMetal(source), 1)` (cluster tier 1 limpo).
- `pieces_sample` → pool fixo com 1× `data.resource`.
- `special` (vazio hoje) → reservado pra drops fixos sem chain.

---

## 6. Recipes — `03_recipes.js`

### 6.1. Por que `event.custom({...})` e não a DSL

API do Create mudou em 6.x. DSL do KubeJS (`event.recipes.create.crushing(...)`) reclama "Constructor not found" pra vários tipos. Usar JSON puro via `event.custom({type: 'create:crushing', ...})` evita o problema e é 1:1 com o que o mod aceita em datapack.

### 6.2. Formato por tipo

**Splashing (Create):**
```js
{
  type: 'create:splashing',
  ingredients: [{ item: input }],
  results: [{ item: output }]
}
```

**Milling / Crushing (Create):**
```js
{
  type: 'create:milling',  // ou 'create:crushing'
  ingredients: [{ item: input }],
  results: [...],  // mix de {item, count} e {item, count, chance}
  processingTime: ticks
}
```

**Melting (Createmetallurgy):** — note `heatRequirement`, `result` plural com `fluid`+`amount`
```js
{
  type: 'createmetallurgy:melting',
  ingredients: [{ item: input }],
  results: [{ fluid: 'createmetallurgy:molten_copper', amount: 120 }],
  processingTime: 80,
  heatRequirement: 'heated'
}
```

**Casting in table (Createmetallurgy):** — `result` SINGULAR, ingredients tem fluid com `nbt: {}` obrigatório
```js
{
  type: 'createmetallurgy:casting_in_table',
  ingredients: [
    { item: 'createmetallurgy:graphite_ingot_mold' },
    { fluid: 'createmetallurgy:molten_copper', amount: 120, nbt: {} }
  ],
  processingTime: 90,
  result: { item: 'minecraft:copper_ingot' }
}
```

**Occultism crushing:** — singular `ingredient`/`result`, próprio `crushing_time`
```js
{
  type: 'occultism:crushing',
  ingredient: { item: input },
  result: { item: output, count: 2 },
  crushing_time: 200
}
```

**Squeezer (Integrated Dynamics):** — `item` singular como input, `result.items` array
```js
{
  type: 'integrateddynamics:squeezer',
  item: { item: input },
  result: { items: [{ item: output }] }
}
```

### 6.3. Casos especiais

- **`hasMolten(metal)`** filtra os 10 metais com molten fluid no Createmetallurgy. Pra platinum/uranium pula `crushed→molten` e `molten→ingot`. Restam dust→ingot via smelt/blast.
- **ancient_debris**: chain só vai até crushing (`clean → ceil(tier/2)× netherite_scrap`). Sem ingot, sem casting.
- **Pieces ores**: só uma receita por source — splashing do dirty → resource.

### 6.4. Removes

```js
// Remove receitas vanilla redundantes / quebra os shortcuts
event.remove({ type: 'minecraft:smelting', input: rawOrCrushed })
event.remove({ type: 'minecraft:blasting', input: rawOrCrushed })
event.remove({ type: 'minecraft:smelting', input: blockId })
event.remove({ type: 'minecraft:blasting', input: blockId })

// Remove dust→ingot do alltheores pra reescrever pesos
event.remove({ type: 'minecraft:crafting_shaped',    output: dust })
event.remove({ type: 'minecraft:crafting_shapeless', output: dust })

// Remove melting/casting padrão do createmetallurgy pra customizar
event.remove({ type: 'createmetallurgy:melting',          input: crushed })
event.remove({ type: 'createmetallurgy:casting_in_table', output: ingot })
event.remove({ type: 'createmetallurgy:casting_in_basin', output: ingot })
```

### 6.5. Magic numbers

| Constante | Valor | Significado |
|---|---|---|
| `MELT_TICKS` | 80 | Tempo de fundição (4s) |
| `CAST_TICKS` | 90 | Tempo de casting (4.5s) |
| `MOLTEN_AMT` | 120 mB | Por ingot — match com Createmetallurgy padrão |
| `CRUSH_TICKS` | 250 | Tempo de crushing (12.5s) |
| `MILL_TICKS` | 200 | Tempo de milling (10s) |
| `SPLASH_TICKS` | 80 | Tempo de splashing (4s) — não usado, splashing não tem processingTime |
| `HEAT_HEATED` | `'heated'` | Heat requirement do melter; alternativas: `'none'`, `'superheated'` |

---

## 7. Como estender

### 7.1. Adicionar um novo cluster_ore

1. Em `00_config.js`, adiciona entry em `OP.cluster_ores`:
   ```js
   bismuthinite: { drops: { bismuth: 90, lead: 10 } }
   ```
2. Se o block ID não segue o padrão `geolosys:<source>_ore` / `geolosys:deepslate_<source>_ore`, adiciona `blocks: ['mod:custom_ore']`.
3. Se introduz metal novo (`bismuth`), adiciona em `OP.METALS`.
4. Se o metal tem molten no Createmetallurgy, adiciona em `CM_METALS` em `03_recipes.js`.
5. Se o metal não tem ingot vanilla nem no `alltheores`, ajusta `OP.metalIngot()` / `OP.metalNugget()`.

`01_items.js`, `02_drops.js` e `03_recipes.js` pegam automaticamente — todos iteram os catálogos.

### 7.2. Adicionar um novo pieces_ore

Apenas adicione em `OP.pieces_ores`:
```js
sulfur: { resource: 'mekanism:sulfur_dust' }
```

### 7.3. Adicionar nova rota de processamento

Em `03_recipes.js`, dentro de `buildMetalChain()`, adicione novo `event.custom({...})` para o seu mod. Reutilize `OP.kjsCluster(metal, t)` e `OP.kjsClusterDirty(metal, t)` no input.

### 7.4. Suportar outro mod de pickaxe (TConstruct, etc.)

Em `02_drops.js`, escreva uma `<mod>ToolCondition(tier)` e adicione mais 1 pool por tier dentro do `processBlock` no branch `cluster` / `pieces`. Mantenha o padrão "1 pool = 1 ferramenta exclusiva" — não combine com `any_of`.

---

## 8. Checklist de validação após mudança

Após editar qualquer script do módulo:

1. **Reinicie o servidor** — o KubeJS faz hot-reload de scripts, mas o registro de itens novos exige restart completo.
2. **`packwiz refresh`** na pasta `pack/` — atualiza os hashes pro cliente baixar.
3. **Verifique os logs** por erros do Rhino (procure `error`, `warn`, `ore_processing`).

Validação in-game:
- [ ] `/kubejs reload server_scripts` não emite erros novos
- [ ] Minerar 1 bloco de cada cluster_ore com cada tier de pickaxe — confirmar que dropa cluster_dirty
- [ ] Lavar cluster_dirty num Splashing → vira cluster (limpo)
- [ ] Cada rota de processamento (Mill / Crush / Squeeze / Occultism) emite o output correto
- [ ] Melter aceita crushed_raw, produz molten
- [ ] Casting Table com graphite mold consome molten, produz ingot
- [ ] EMI mostra todos os drops + receitas (clica num cluster_dirty na busca, confere lista)

---

## 9. Limitações conhecidas / TODOs

- **Pesos não foram balanceados em playtest real.** Os números em `TIER_WEIGHTS` e `PIECES_TIER_WEIGHTS` são chutes razoáveis, não calibrados.
- **Não há fallback pra blocos que apareçam depois.** Se um mod adiciona `geolosys:nova_ore` em runtime/datapack, ele não entra no `blockToSource`.
- **`special_ores` vazio.** A categoria existe mas nenhum minério usa hoje. Caso special_ores reapareça, garantir que `cluster_item` está populado.
- **TConstruct e outros mods de tool não detectados.** Só vanilla pickaxes + Silent Gear.
- **JEI clutter.** Os 260+ itens internos aparecem na busca do JEI sem filtro. Falta `JEI hide` pra `#kubejs:ore_processing` (será coberto pela migração do sistema `JEI hide patterns` do kubejs-old).
- **Sem creative tab própria.** Itens caem no tab "Misc" default.
- **Advancements vanilla podem ter quebrado.** "Acquire Hardware" depende de smelting de raw_iron — removemos esse smelting do bloco mas o raw_iron vanilla ainda existe e pode ser obtido por outras vias.

Ver também:
- [`docs/ore-processing.md`](../ore-processing.md) — doc do player
- Memórias internas: `project_ore_processing.md`, `feedback_loot_display.md`
