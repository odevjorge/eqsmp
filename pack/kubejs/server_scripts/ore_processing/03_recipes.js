// =========================================================================
// ORE PROCESSING — Recipes
// =========================================================================
// Receitas usam event.custom({...}) (JSON puro) em vez de DSL do KubeJS pra
// Create 6.x, porque a API mudou e KubeJS reclama "Constructor not found".
//
// Por metal (exceto ancient_debris), por tier 1..10:
//   1. Splashing  : dirty cluster  → clean cluster
//   2. Occultism  : dirty cluster  → 2× nugget  (rota alternativa)
//   3. Milling    : clean cluster  → 1-2× nugget + prev tier cluster (degrada)
//   4. Crushing   : clean cluster  → 2-4× crushed + prev tier cluster (degrada)
//   5. Squeezer   : clean cluster  → 1× nugget
//
// Por metal (uma vez):
//   - 9× nugget → 1× crushed (vanilla shaped)
//   - 3× crushed → 2× dust (vanilla shapeless)
//   - crushed → molten (createmetallurgy melting)
//   - raw → molten (se raw existir)
//   - molten → ingot (createmetallurgy casting_in_table)
//   - dust → ingot (vanilla smelting + blasting)
//
// Ancient debris (special): splashing + crushing → netherite_scrap (scaling por tier).
// Pieces ores: splashing simples dirty → resource.

;(function() {

const HEAT_HEATED = 'heated'
const MELT_TICKS  = 80
const CAST_TICKS  = 90
const MOLTEN_AMT  = 120  // mB

const CRUSH_TICKS    = 250
const MILL_TICKS     = 200
const SPLASH_TICKS   = 80

// Metais que o createmetallurgy define como molten fluid. Pra os demais
// (platinum, uranium), pula a chain de melting/casting — sobra só dust→ingot
// via vanilla smelting/blasting.
const CM_METALS = [
  'aluminum', 'copper', 'gold', 'iron', 'lead',
  'nickel', 'osmium', 'silver', 'tin', 'zinc'
]
function hasMolten(metal) { return CM_METALS.indexOf(metal) !== -1 }

// Helpers JSON
function item(id, count) { return { item: id, count: count || 1 } }
function itemChance(id, count, chance) { return { item: id, count: count || 1, chance: chance } }

function recipeSplashing(event, output, input) {
  event.custom({
    type: 'create:splashing',
    ingredients: [{ item: input }],
    results: [{ item: output }]
  })
}

// Horse Powered grindstone (manual ou tracionado): clean cluster → nugget.
// Rota MANUAL pobre — rende menos que a Create millstone (que é a rota
// automatizável). Aceita qualquer tier via item específico (chamado por tier).
function recipeHorseGrinding(event, output, count, input, time) {
  event.custom({
    type: 'horsepowered:grinding',
    ingredient: { item: input },
    result: { item: output, count: count || 1 },
    time: time || 200
  })
}

// Horse Powered drying rack: dirty cluster → clean cluster. É a "lavagem"
// MANUAL — MUITO lenta (4000 ticks ≈ 200s) vs Create splashing (instantâneo,
// automatizável). Rota braçal de early game pra limpar o minério.
function recipeHorseDrying(event, output, input, time) {
  event.custom({
    type: 'horsepowered:drying',
    ingredient: { item: input },
    result: { item: output, count: 1 },
    time: time || 4000
  })
}


function recipeMilling(event, results, input, time) {
  event.custom({
    type: 'create:milling',
    ingredients: [{ item: input }],
    results: results,
    processingTime: time || MILL_TICKS
  })
}

function recipeCrushing(event, results, input, time) {
  event.custom({
    type: 'create:crushing',
    ingredients: [{ item: input }],
    results: results,
    processingTime: time || CRUSH_TICKS
  })
}

function recipeMelting(event, fluidId, fluidAmount, input, ticks) {
  event.custom({
    type: 'createmetallurgy:melting',
    ingredients: [{ item: input }],
    results: [{ fluid: fluidId, amount: fluidAmount }],
    processingTime: ticks || MELT_TICKS,
    heatRequirement: HEAT_HEATED
  })
}

// casting_in_table usa `result` SINGULAR + ingredients sem wrapper input_/.
function recipeCasting(event, fluidId, fluidAmount, mold, output, ticks) {
  event.custom({
    type: 'createmetallurgy:casting_in_table',
    ingredients: [
      { item: mold },
      { fluid: fluidId, amount: fluidAmount, nbt: {} }
    ],
    processingTime: ticks || CAST_TICKS,
    result: { item: output }
  })
}

function recipeOccultismCrushing(event, output, count, input) {
  event.custom({
    type: 'occultism:crushing',
    ingredient: { item: input },
    result: { item: output, count: count },
    crushing_time: 200
  })
}

function recipeSqueezer(event, input, outputId) {
  event.custom({
    type: 'integrateddynamics:squeezer',
    item: { item: input },
    result: { items: [{ item: outputId }] }
  })
}

ServerEvents.recipes(event => {
  const OP = global.OreProcessing
  if (!OP || !OP.METALS) {
    console.error('[ore_processing/03_recipes] global.OreProcessing não carregado')
    return
  }

  // -----------------------------------------------------------------------
  // Por metal padrão (exceto ancient_debris)
  // -----------------------------------------------------------------------
  function buildMetalChain(metal) {
    var crushed = OP.metalCrushed(metal)
    var raw     = OP.metalRaw(metal)
    var dust    = OP.metalDust(metal)
    var ingot   = OP.metalIngot(metal)
    var nugget  = OP.metalNugget(metal)
    var molten  = OP.metalMolten(metal)

    // Per-tier processing
    for (var t = 1; t <= OP.CLUSTER_TIERS; t++) {
      (function(t) {
        var dirty = OP.kjsClusterDirty(metal, t)
        var clean = OP.kjsCluster(metal, t)
        var prev  = t > 1 ? OP.kjsCluster(metal, t - 1) : null

        // 1. Splashing: dirty → clean (Create, 1:1 automatizável)
        recipeSplashing(event, clean, dirty)

        // 1b. Horse Powered drying rack: dirty → clean (lavagem MANUAL, ~200s, lenta)
        recipeHorseDrying(event, clean, dirty)

        // 2. Occultism crushing: dirty → 2× nugget
        recipeOccultismCrushing(event, nugget, 2, dirty)

        // 3. Milling (Create millstone): clean → 2 nuggets + chance de 3º (+ degrada tier)
        //    BUFFADA — é a rota automatizável eficiente. Horse grindstone rende menos.
        var mill = [
          item(nugget, 2),
          itemChance(nugget, 1, 0.25)
        ]
        if (prev) mill.push(item(prev, 1))
        recipeMilling(event, mill, clean)

        // 3b. Horse Powered grindstone: clean → 1 nugget (rota MANUAL pobre vs millstone)
        recipeHorseGrinding(event, nugget, 1, clean, 200)

        // 4. Crushing: clean → crushed_raw (+ prev cluster degradado)
        var crush = [
          item(crushed, 2),
          itemChance(crushed, 1, 0.75),
          itemChance(crushed, 1, 0.25)
        ]
        if (prev) crush.push(item(prev, 1))
        recipeCrushing(event, crush, clean)

        // 5. Squeezer: clean → 1× nugget
        recipeSqueezer(event, clean, nugget)
      })(t)
    }

    // Vanilla recipes (uma vez por metal)

    // 9× nugget → 1× crushed
    event.shaped(crushed, ['NNN', 'NNN', 'NNN'], { N: nugget })

    // 3× crushed → 2× dust
    event.remove({ type: 'minecraft:crafting_shaped',    output: dust })
    event.remove({ type: 'minecraft:crafting_shapeless', output: dust })
    event.shapeless(Item.of(dust, 2), [crushed, crushed, crushed])

    // Chain de melting/casting só pra metais com molten fluid no createmetallurgy
    if (hasMolten(metal)) {
      // crushed → molten
      event.remove({ type: 'createmetallurgy:melting', input: crushed })
      recipeMelting(event, molten, MOLTEN_AMT, crushed, MELT_TICKS)

      // raw → molten (se raw existir)
      if (raw) {
        event.remove({ type: 'createmetallurgy:melting', input: raw })
        recipeMelting(event, molten, MOLTEN_AMT, raw, MELT_TICKS)
      }

      // Casting: molten → ingot
      event.remove({ type: 'createmetallurgy:casting_in_table', output: ingot })
      event.remove({ type: 'createmetallurgy:casting_in_basin', output: ingot })
      recipeCasting(event, molten, MOLTEN_AMT, 'createmetallurgy:graphite_ingot_mold', ingot, CAST_TICKS)
    }

    // Dust → ingot (fallback)
    event.smelting(ingot, dust)
    event.blasting(ingot, dust)

    // Remove shortcuts vanilla raw/crushed → ingot
    if (raw) {
      event.remove({ type: 'minecraft:smelting', input: raw })
      event.remove({ type: 'minecraft:blasting', input: raw })
    }
    event.remove({ type: 'minecraft:smelting', input: crushed })
    event.remove({ type: 'minecraft:blasting', input: crushed })
  }

  OP.METALS.filter(function(m) { return m !== 'ancient_debris' }).forEach(buildMetalChain)

  // -----------------------------------------------------------------------
  // Ancient debris: splashing + crushing → netherite_scrap (scrap = ceil(tier/2))
  // -----------------------------------------------------------------------
  for (var t = 1; t <= OP.CLUSTER_TIERS; t++) {
    (function(t) {
      var dirty = OP.kjsClusterDirty('ancient_debris', t)
      var clean = OP.kjsCluster('ancient_debris', t)
      var prev  = t > 1 ? OP.kjsCluster('ancient_debris', t - 1) : null
      var scrapCount = Math.ceil(t / 2)

      recipeSplashing(event, clean, dirty)

      var crush = [item('minecraft:netherite_scrap', scrapCount)]
      if (prev) crush.push(item(prev, 1))
      recipeCrushing(event, crush, clean)
    })(t)
  }

  // -----------------------------------------------------------------------
  // Pieces ores: splashing dirty → resource
  // -----------------------------------------------------------------------
  Object.keys(OP.pieces_ores).forEach(function(source) {
    var dirty = OP.kjsPieceDirty(source)
    var resource = OP.pieces_ores[source].resource
    recipeSplashing(event, resource, dirty)
  })

  // -----------------------------------------------------------------------
  // Remove smelting/blasting dos ore blocks vanilla
  // -----------------------------------------------------------------------
  Object.keys(OP.blockToSource).forEach(function(blockId) {
    var info = OP.blockToSource[blockId]
    if (info.kind === 'cluster' || info.kind === 'pieces' || info.kind === 'special') {
      event.remove({ type: 'minecraft:smelting', input: blockId })
      event.remove({ type: 'minecraft:blasting', input: blockId })
    }
  })

  console.log('[ore_processing/03_recipes] receitas registradas')
})

})()
