// =========================================================================
// ORE PROCESSING — Drops (ServerEvents.blockLootTables)
// =========================================================================
// Substitui as loot tables dos minérios geolosys via KubeJS nativo. Diferente
// do LootJS.modifiers (runtime apply), aqui as modificações entram no JSON da
// loot table e são sincronizadas server→client por datapack vanilla — Advanced
// Loot Info / EMI / JEI introspectam corretamente.
//
//   cluster_ore (azurite, ...):  pool por tier de picareta, weight = metalChance × tierWeight
//                                drop: kubejs:<metal>_cluster_<1..10>_dirty
//   cluster_sample:              drop fixo kubejs:<primaryMetal>_cluster_1 (limpo)
//   pieces_ore (coal, ...):      pool por tier de picareta, weight = PIECES_TIER_WEIGHTS
//                                drop: N × kubejs:<source>_dirty (N=1..5)
//   pieces_sample:               drop direto do resource
//   special (ancient_debris):    drop fixo do cluster_item

;(function() {

// Picaretas vanilla por tier (qualquer um na lista satisfaz o tier).
const VANILLA_PICKAXES = {
  iron:      ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe',
              'minecraft:golden_pickaxe', 'minecraft:iron_pickaxe'],
  diamond:   ['minecraft:diamond_pickaxe'],
  netherite: ['minecraft:netherite_pickaxe']
}

// Conditions separadas (em vez de any_of, que tem problemas de serialização).
// Cada condition vira um pool independente — só um vai matchear por vez (jogador
// segura um tool só), então não há double-drop.
function vanillaToolCondition(tier) {
  return {
    condition: 'minecraft:match_tool',
    predicate: { items: VANILLA_PICKAXES[tier] }
  }
}

function sgearToolCondition(tier) {
  return {
    condition: 'minecraft:match_tool',
    predicate: {
      items: ['silentgear:pickaxe'],
      nbt: '{SGear_Data:{Properties:{HarvestTier:"minecraft:' + tier + '"}}}'
    }
  }
}

// Helper: adiciona entry de item com peso e count fixo
function addWeightedItem(pool, itemId, weight, count) {
  pool.addItem(Item.of(itemId, count || 1), weight)
}

// Constrói pool de cluster_ore pra um (source, tier de picareta, condition).
// weight final = metalChance(0-100) × OP.TIER_WEIGHTS[tier][clusterTier-1]
function buildClusterPool(table, OP, source, pickaxeTier, condition) {
  var ore = OP.cluster_ores[source]
  var tierWeights = OP.TIER_WEIGHTS[pickaxeTier]

  table.addPool(function(pool) {
    pool.setUniformRolls(1, 1)
    pool.addCondition(condition)

    Object.keys(ore.drops).forEach(function(metal) {
      var metalChance = ore.drops[metal]
      for (var t = 1; t <= OP.CLUSTER_TIERS; t++) {
        (function(t) {
          var w = metalChance * tierWeights[t - 1]
          if (w <= 0) return
          addWeightedItem(pool, OP.kjsClusterDirty(metal, t), w, 1)
        })(t)
      }
    })
  })
}

// Constrói pool de pieces_ore pra um (source, tier de picareta, condition).
// 5 entries (count 1..5) com pesos de OP.PIECES_TIER_WEIGHTS
function buildPiecesPool(table, OP, source, pickaxeTier, condition) {
  var weights = OP.PIECES_TIER_WEIGHTS[pickaxeTier]

  table.addPool(function(pool) {
    pool.setUniformRolls(1, 1)
    pool.addCondition(condition)

    for (var count = 1; count <= 5; count++) {
      (function(count) {
        var w = weights[count - 1]
        if (w <= 0) return
        addWeightedItem(pool, OP.kjsPieceDirty(source), w, count)
      })(count)
    }
  })
}

// Pool simples de 1 item garantido (samples, special)
function buildFixedPool(table, itemId, count) {
  table.addPool(pool => {
    pool.setUniformRolls(1, 1)
    pool.addItem(Item.of(itemId, count || 1))
  })
}

ServerEvents.blockLootTables(event => {
  const OP = global.OreProcessing
  if (!OP || !OP.blockToSource) {
    console.error('[ore_processing/02_drops] global.OreProcessing.blockToSource não está carregado')
    return
  }

  const TIERS = ['iron', 'diamond', 'netherite']

  // Rhino/KubeJS: const/let dentro de forEach são function-scoped → "redeclaration".
  // Workaround: corpo da iteração numa função própria pra ter scope per-iteração.
  function processBlock(blockId, info) {
    var source = info.source

    event.modifyBlock(blockId, function(table) {
      table.clearPools()

      if (info.kind === 'cluster') {
        TIERS.forEach(function(t) {
          buildClusterPool(table, OP, source, t, vanillaToolCondition(t))
          buildClusterPool(table, OP, source, t, sgearToolCondition(t))
        })

      } else if (info.kind === 'cluster_sample') {
        var primary = OP.primaryMetal(source)
        buildFixedPool(table, OP.kjsCluster(primary, 1), 1)

      } else if (info.kind === 'pieces') {
        TIERS.forEach(function(t) {
          buildPiecesPool(table, OP, source, t, vanillaToolCondition(t))
          buildPiecesPool(table, OP, source, t, sgearToolCondition(t))
        })

      } else if (info.kind === 'pieces_sample') {
        var data = OP.pieces_ores[source]
        buildFixedPool(table, data.resource, 1)

      } else if (info.kind === 'special') {
        var specialData = OP.special_ores[source]
        buildFixedPool(table, specialData.cluster_item, 1)
      }
    })
  }

  Object.keys(OP.blockToSource).forEach(function(blockId) {
    processBlock(blockId, OP.blockToSource[blockId])
  })

  console.log('[ore_processing/02_drops] loot tables modificadas via ServerEvents')
})

})()
