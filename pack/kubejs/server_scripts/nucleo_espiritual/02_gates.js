// =========================================================================
// NÚCLEO ESPIRITUAL — Cross-mod gates (consumers)
// =========================================================================
// Receitas modificadas pra exigir Núcleo Espiritual:
//   - ars_nouveau:ritual_brazier (bloco core do sistema de rituais Ars)
//   - botania:terrasteel_ingot   (via terra_plate; tier 3 magical Botania)
//
// Ritual_brazier destrava SIDE Ars (rituals: bonemeal cycle, jump boost,
// wilden chimera, etc — toda mágica ritual gigante). Terrasteel destrava
// tier 3 magical SG (terra tools + elementium chain via terra_axe → ...).
//
// Diferente de F1-F3 onde substituímos ingrediente, aqui ADICIONAMOS o
// nucleo_espiritual à recipe — mantém os ingredientes vanilla (gold blocks,
// arcane_pedestal, manasteel, etc) e exige nucleo no centro/ingrediente extra.

;(function() {

ServerEvents.recipes(function(event) {
  var NE = global.NucleoEspiritual
  if (!NE) {
    console.error('[nucleo_espiritual/gates] global.NucleoEspiritual não carregado')
    return
  }

  // -----------------------------------------------------------------------
  // ARS NOUVEAU: ritual_brazier — Núcleo destrava sistema ritual
  // Vanilla: shapeless arcane_pedestal + source_block + 3× gold
  // Override: adiciona 1× nucleo_espiritual à recipe shapeless
  // -----------------------------------------------------------------------
  event.remove({ id: 'ars_nouveau:ritual_brazier' })

  event.shapeless('ars_nouveau:ritual_brazier', [
    'ars_nouveau:arcane_pedestal',
    '#forge:storage_blocks/source',
    '#forge:ingots/gold',
    '#forge:ingots/gold',
    '#forge:ingots/gold',
    NE.ITEMS.nucleo
  ]).id('kubejs:gates/ritual_brazier')

  // -----------------------------------------------------------------------
  // BOTANIA: terrasteel_ingot — Núcleo destrava tier 3 magical
  // Vanilla: terra_plate manasteel + mana_pearl + mana_diamond + 500k mana
  // Override: adiciona 1× nucleo_espiritual aos ingredients (4 total),
  // mantém mana cost. Player ainda precisa terra_plate (4 livingrock + 4
  // lapis + 1 mana_pool — já F1-gated via mana_pool=otherstone) construído.
  // -----------------------------------------------------------------------
  event.remove({ id: 'botania:terra_plate/terrasteel_ingot' })

  event.custom({
    type: 'botania:terra_plate',
    ingredients: [
      { item: 'botania:manasteel_ingot' },
      { item: 'botania:mana_pearl' },
      { item: 'botania:mana_diamond' },
      { item: NE.ITEMS.nucleo }
    ],
    mana: 500000,
    result: { item: 'botania:terrasteel_ingot' }
  }).id('kubejs:gates/terrasteel_ingot')

  console.log('[nucleo_espiritual/gates] 2 receitas modificadas (ritual_brazier + terrasteel_ingot)')
})

})()
