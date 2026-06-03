// =========================================================================
// AGLUTINADO MÁGICO — Squeezer setup + processing (3 tiers)
// =========================================================================
// 1. Squeezer recipe override — sem iron (interdependência madeira + andesite
//    compactado). Player consegue craftar squeezer sem precisar minerar iron
//    primeiro, evitando ciclo Create↔ore_processing.
//
// 2. Processing sourceberry_sack_x1 → cursed_aglutinado_magico em 3 tiers:
//    - Tier 1 (millstone Create T3):       1 cursed + 25% chance +1
//    - Tier 2 (crushing wheels Create T4): 2 cursed + 50% chance +1
//    - Tier 3 (squeezer IntegratedDynamics): 1 cursed + 100mB source_fluid
//
// Filosofia "ineficiente → upgrade": player começa moendo (lento), upgrada
// pra crushing (2× output), eventualmente squeezer (bonus de source_fluid).

;(function() {

ServerEvents.recipes(function(event) {
  var AG = global.AglutinadoMagico
  if (!AG) {
    console.error('[aglutinado_magico/squeezer] global.AglutinadoMagico não carregado')
    return
  }

  var SACK_X1 = AG.ITEMS.sack_prefix + '1'
  var CURSED = AG.ITEMS.cursed

  // -----------------------------------------------------------------------
  // 1. Squeezer recipe override (sem iron)
  // -----------------------------------------------------------------------
  event.remove({ type: 'minecraft:crafting_shaped', output: 'integrateddynamics:squeezer' })
  event.shaped('integrateddynamics:squeezer', [
    'SBS',
    'S S',
    'BAB'
  ], {
    S: 'botania:livingwood_twig',
    B: 'allthecompressed:andesite_1x',
    A: 'allthecompressed:andesite_2x'
  })

  // -----------------------------------------------------------------------
  // 2. Tier 1 — Millstone (Create T3)
  // event.custom() com JSON em vez de DSL: Create 6.x quebrou a API do KubeJS.
  // .id() explícito pra idempotência on /reload.
  // -----------------------------------------------------------------------
  event.custom({
    type: 'create:milling',
    ingredients: [{ item: SACK_X1 }],
    results: [
      { item: CURSED, count: 1 },
      { item: CURSED, count: 1, chance: 0.25 }
    ],
    processingTime: 200
  }).id('kubejs:cursed_aglutinado/milling')

  // -----------------------------------------------------------------------
  // 3. Tier 2 — Crushing wheels (Create T4)
  // -----------------------------------------------------------------------
  event.custom({
    type: 'create:crushing',
    ingredients: [{ item: SACK_X1 }],
    results: [
      { item: CURSED, count: 2 },
      { item: CURSED, count: 1, chance: 0.50 }
    ],
    processingTime: 250
  }).id('kubejs:cursed_aglutinado/crushing')

  // -----------------------------------------------------------------------
  // 4. Tier 3 — Squeezer (IntegratedDynamics)
  // -----------------------------------------------------------------------
  event.custom({
    type: 'integrateddynamics:squeezer',
    item: { item: SACK_X1 },
    result: {
      items: [
        { item: CURSED }
      ],
      fluid: {
        fluid: 'liquidars:source_fluid',
        amount: 100
      }
    }
  }).id('kubejs:cursed_aglutinado/squeezer')

  console.log('[aglutinado_magico/squeezer] 3 tiers de processing + recipe override registrados')
})

})()
