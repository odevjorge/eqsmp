// =========================================================================
// ORE PROCESSING — Config
// =========================================================================
// Catálogo de minérios (cluster, pieces, special), pesos de tier por picareta,
// helpers de derivação de IDs por convenção, e sorteios de runtime.
//
// Uso em outros scripts:
//   const OP = global.OreProcessing
//   OP.cluster_ores, OP.rollClusterTier(tier), OP.metalMolten('copper'), etc.
//
// Convenções (vide helpers da seção 3):
//   block:   geolosys:<source>_ore + geolosys:deepslate_<source>_ore
//   sample:  geolosys:<source>_ore_sample
//   nugget:  alltheores:<metal>_nugget (vanilla pra gold/iron)
//   ingot:   alltheores:<metal>_ingot  (vanilla pra gold/iron)
//   molten:  createmetallurgy:molten_<metal>
//   cluster: kubejs:<metal>_cluster_<tier>           [interno]
//   dirty:   kubejs:<metal>_cluster_<tier>_dirty     [interno]
//   piece:   kubejs:<source>_dirty                   [interno, pieces_ores]

// IIFE pra isolar `const OP` — KubeJS Rhino compartilha escopo entre scripts do mesmo tipo,
// então sem o wrap, declarar `const OP` aqui conflita com outros arquivos do ore_processing.
;(function() {

global.OreProcessing = {}
const OP = global.OreProcessing


// =========================================================================
// 1. CONSTANTES
// =========================================================================

OP.CLUSTER_TIERS = 10

// Pesos relativos por tier dado o tier da picareta. Não precisam somar 100.
OP.TIER_WEIGHTS = {
  iron:      [15, 25, 25, 15,  5,  5,  5,  2,  1,  1],
  diamond:   [ 5,  5,  8,  8, 25, 25, 25, 10,  8,  5],
  netherite: [ 5,  5,  8,  8, 20, 20, 23, 25, 25, 20]
}

// Quantidade de pieces dropadas por bloco (1..5), escalando com a picareta.
// Médias: iron 1.71, diamond 2.80, netherite 4.10
OP.PIECES_TIER_WEIGHTS = {
  iron:      [50, 35, 10,  4,  1],
  diamond:   [17, 26, 27, 20, 10],
  netherite: [ 3,  6, 15, 30, 46]
}

// Metais "comuns" (12) + ancient_debris (não passa pela chain de melting/ingot,
// crusha direto pra netherite_scrap em 03_recipes.js).
OP.METALS = [
  'aluminum', 'copper', 'gold', 'iron', 'lead', 'nickel',
  'osmium', 'platinum', 'silver', 'tin', 'uranium', 'zinc',
  'ancient_debris'
]


// =========================================================================
// 2. CATÁLOGO
// =========================================================================

// cluster_ores: chain completa (mining → cluster_dirty → wash → ... → fluid → ingot)
//   drops:  { metal: chance%, ... }   — soma 100; principal = maior %.
//   blocks: opcional — sobrescreve a derivação padrão.
OP.cluster_ores = {
  azurite:     { drops: { copper: 92,    gold: 5,    silver: 3                } },
  malachite:   { drops: { copper: 92,    silver: 5,  nickel: 3                } },
  galena:      { drops: { lead: 77,      silver: 15, zinc: 8                  } },
  sphalerite:  { drops: { zinc: 80,      lead: 15,   copper: 5                } },
  cassiterite: { drops: { tin: 100                                            } },
  teallite:    { drops: { tin: 70,       lead: 30                             } },
  hematite:    { drops: { iron: 98,      copper: 1,  gold: 1                  } },
  limonite:    { drops: { iron: 83,      nickel: 10, copper: 5,  platinum: 2  } },
  gold:        { drops: { gold: 85,      silver: 10, copper: 5                } },
  nether_gold: { drops: { gold: 100                                           }, blocks: ['geolosys:nether_gold_ore'] },
  bauxite:     { drops: { aluminum: 88,  iron: 12                             } },
  autunite:    { drops: { uranium: 95,   copper: 5                            } },
  platinum:    { drops: { platinum: 85,  osmium: 5,  nickel: 6,  copper: 4    } },
  // ancient_debris: chain similar mas crushing vai direto pra netherite_scrap
  // (sem melting/ingot — tratado especial em 03_recipes.js)
  ancient_debris: { drops: { ancient_debris: 100 }, blocks: ['geolosys:ancient_debris_ore'] }
}

// pieces_ores: chain curta (mining → <source>_dirty → wash → resource)
OP.pieces_ores = {
  coal:       { resource: 'minecraft:coal'                  },
  quartz:     { resource: 'minecraft:quartz'                },
  lapis:      { resource: 'minecraft:lapis_lazuli'          },
  cinnabar:   { resource: 'minecraft:redstone'              },
  beryl:      { resource: 'shards_and_pieces:emerald_shard' },
  kimberlite: { resource: 'shards_and_pieces:diamond_shard' }
}

// Casos fora do padrão. Vazio por enquanto — ancient_debris foi pra cluster_ores
// pra ter o mesmo tratamento de tier/dirty. O destino especial dele
// (netherite_scrap em vez de ingot) é tratado em 03_recipes.js.
OP.special_ores = {}


// =========================================================================
// 3. HELPERS DE CONVENÇÃO
// =========================================================================

OP.oreBlocks = (source, override) =>
  override || [`geolosys:${source}_ore`, `geolosys:deepslate_${source}_ore`]

OP.oreSample = (source) => `geolosys:${source}_ore_sample`

OP.metalNugget = (metal) =>
  metal === 'gold' || metal === 'iron'
    ? `minecraft:${metal}_nugget`
    : `alltheores:${metal}_nugget`

// Copper ingot existe vanilla em 1.20.1; só metais sem versão vanilla vão pro alltheores.
OP.metalIngot = (metal) =>
  metal === 'gold' || metal === 'iron' || metal === 'copper'
    ? `minecraft:${metal}_ingot`
    : `alltheores:${metal}_ingot`

OP.metalMolten = (metal) => `createmetallurgy:molten_${metal}`

// Create adiciona crushed_raw_X pra todos os metais (mesmo os do alltheores).
OP.metalCrushed = (metal) => `create:crushed_raw_${metal}`

// Raw blocks só existem pros vanilla.
OP.metalRaw = (metal) =>
  (metal === 'copper' || metal === 'gold' || metal === 'iron')
    ? `minecraft:raw_${metal}` : null

// Dusts são todos do alltheores.
OP.metalDust = (metal) => `alltheores:${metal}_dust`

// Workaround Rhino: function expression + string concat estava retornando valor
// cacheado da primeira chamada. Array.join evita o caching/otimização defeituosa.
OP.kjsCluster      = function(metal, tier) { return ['kubejs:', metal, '_cluster_', tier].join('') }
OP.kjsClusterDirty = function(metal, tier) { return ['kubejs:', metal, '_cluster_', tier, '_dirty'].join('') }
OP.kjsPieceDirty   = function(source)      { return ['kubejs:', source, '_dirty'].join('') }


// =========================================================================
// 4. SORTEIOS
// =========================================================================

OP.rollClusterTier = (pickaxeTier) => {
  const weights = OP.TIER_WEIGHTS[pickaxeTier] || OP.TIER_WEIGHTS.iron
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i + 1
    r -= weights[i]
  }
  return weights.length
}

OP.rollPiecesCount = (pickaxeTier) => {
  const weights = OP.PIECES_TIER_WEIGHTS[pickaxeTier] || OP.PIECES_TIER_WEIGHTS.iron
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i + 1
    r -= weights[i]
  }
  return weights.length
}

OP.rollClusterMetal = (sourceName) => {
  const ore = OP.cluster_ores[sourceName]
  if (!ore) return null
  let r = Math.random() * 100
  for (const [metal, chance] of Object.entries(ore.drops)) {
    if (r < chance) return metal
    r -= chance
  }
  return Object.keys(ore.drops)[0]
}

OP.primaryMetal = (sourceName) => {
  const drops = OP.cluster_ores[sourceName].drops
  return Object.entries(drops).reduce((a, b) => a[1] >= b[1] ? a : b)[0]
}


// =========================================================================
// 5. MAPA REVERSO block_id → { kind, source }
// =========================================================================

OP.blockToSource = {}
const indexBlock = (kind, source, block) => {
  OP.blockToSource[block] = { kind: kind, source: source }
}

Object.entries(OP.cluster_ores).forEach(([source, data]) => {
  OP.oreBlocks(source, data.blocks).forEach(b => indexBlock('cluster', source, b))
  indexBlock('cluster_sample', source, OP.oreSample(source))
})
Object.entries(OP.pieces_ores).forEach(([source, data]) => {
  OP.oreBlocks(source, data.blocks).forEach(b => indexBlock('pieces', source, b))
  indexBlock('pieces_sample', source, OP.oreSample(source))
})
Object.entries(OP.special_ores).forEach(([source, data]) => {
  data.blocks.forEach(b => indexBlock('special', source, b))
})


// =========================================================================
// 6. VALIDAÇÃO
// =========================================================================

Object.entries(OP.cluster_ores).forEach(([source, data]) => {
  const sum = Object.values(data.drops).reduce((s, c) => s + c, 0)
  if (sum !== 100) {
    console.warn(`[ore_processing] ${source}.drops soma ${sum}, deveria somar 100`)
  }
})

})()
