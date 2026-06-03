// =========================================================================
// NÚCLEO CINÉTICO — Cross-mod gates (consumers)
// =========================================================================
// Receitas modificadas pra exigir Núcleo Cinético:
//   - botania:runic_altar (BLOCO)      — destrava árvore inteira de runas
//   - ars_nouveau:enchanting_apparatus  — destrava 50+ apparatus recipes
//
// Vanilla: runic_altar precisava livingrock + mana_pearl OU mana_diamond.
//          enchanting_apparatus precisava 4× sourcestone + 2× gold + 4× nugget + 1× diamond.
//
// Override exige nucleo_cinetico no centro. Como nucleo é Create+Ars+Occultism
// +Botania-gated transitivamente (via aglutinado pra andesite_alloy →
// mechanical_crafter → cursed → ritual foliot), F2 = real progression gate.

;(function() {

ServerEvents.recipes(function(event) {
  var NC = global.NucleoCinetico
  if (!NC) {
    console.error('[nucleo_cinetico/gates] global.NucleoCinetico não carregado')
    return
  }

  // -----------------------------------------------------------------------
  // BOTANIA: runic_altar (bloco) — Núcleo Cinético destrava runas
  // 5× livingrock + 1× nucleo_cinetico → 1× runic_altar
  //
  // Remove ambas rotas vanilla (mana_pearl e mana_diamond) — substitui por
  // receita única com nucleo no centro.
  // -----------------------------------------------------------------------
  event.remove({ id: 'botania:runic_altar' })
  event.remove({ id: 'botania:runic_altar_alt' })

  event.shaped('botania:runic_altar', [
    'SSS',
    'SNS'
  ], {
    S: 'botania:livingrock',
    N: NC.ITEMS.nucleo
  }).id('kubejs:gates/runic_altar')

  // -----------------------------------------------------------------------
  // ARS NOUVEAU: enchanting_apparatus (bloco) — Núcleo destrava apparatus
  // Replace o diamante central por nucleo_cinetico. Mantém pattern original
  // (4× sourcestone + 2× gold + 4× nugget + 1× nucleo).
  // -----------------------------------------------------------------------
  event.remove({ id: 'ars_nouveau:enchanting_apparatus' })

  event.shaped('ars_nouveau:enchanting_apparatus', [
    'nsn',
    'gNg',
    'nsn'
  ], {
    n: '#forge:nuggets/gold',
    s: 'ars_nouveau:sourcestone',
    g: '#forge:ingots/gold',
    N: NC.ITEMS.nucleo
  }).id('kubejs:gates/enchanting_apparatus')

  console.log('[nucleo_cinetico/gates] 2 receitas modificadas (runic_altar + enchanting_apparatus)')
})

})()
