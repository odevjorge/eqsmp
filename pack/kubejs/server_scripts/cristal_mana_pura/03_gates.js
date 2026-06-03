// =========================================================================
// CRISTAL DE MANA PURA — Cross-mod gates (consumers)
// =========================================================================
// Receitas modificadas pra exigir Cristal de Mana Pura:
//   - occultism:book_of_binding_djinni (paralelo ao F1's foliot gate)
//   - create:mechanical_arm             (substitui precision_mechanism por cristal)
//
// Padrão dos books: F1 gateou foliot. F3 gateia djinni. F4 (futuro) vai
// gatear marid via núcleo_espiritual.
//
// Mechanical_arm é tier-2 logistic do Create (puxa/empurra items entre
// inventários). Gatear ele força player a fazer F3 antes de automação
// pesada — alinha com o ritmo grindy do modpack.

;(function() {

ServerEvents.recipes(function(event) {
  var CR = global.CristalManaPura
  if (!CR) {
    console.error('[cristal_mana_pura/gates] global.CristalManaPura não carregado')
    return
  }

  // -----------------------------------------------------------------------
  // OCCULTISM: book_of_binding_djinni — Cristal gateia tier 2 spirit
  // Remove ambas as rotas vanilla (full ingrediente e from_empty barato),
  // substitui por receita única com cristal_mana_pura no centro.
  // Padrão: dye yellow nas bordas + book_of_binding_empty + cristal.
  // -----------------------------------------------------------------------
  event.remove({ id: 'occultism:crafting/book_of_binding_djinni' })
  event.remove({ id: 'occultism:crafting/book_of_binding_djinni_from_empty' })

  event.shaped('occultism:book_of_binding_djinni', [
    ' Y ',
    'YBC',
    ' Y '
  ], {
    Y: '#forge:dyes/yellow',
    B: 'occultism:book_of_binding_empty',
    C: CR.ITEMS.cristal
  }).id('kubejs:gates/book_of_binding_djinni')

  // -----------------------------------------------------------------------
  // CREATE: mechanical_arm — Cristal substitui precision_mechanism
  // Pattern original:
  //   LLA
  //   L
  //   IC
  // L=brass_plate, A=andesite_alloy, I=precision_mechanism, C=brass_casing
  //
  // Override: substituímos I (precision_mechanism) por nosso Cristal.
  // O resto da receita continua igual — player ainda precisa fazer
  // brass_casing (gate Create existente) e brass_plate (rolling mill).
  // -----------------------------------------------------------------------
  event.remove({ id: 'create:crafting/kinetics/mechanical_arm' })

  event.shaped('create:mechanical_arm', [
    'LLA',
    'L  ',
    'CB '
  ], {
    L: '#forge:plates/brass',
    A: 'create:andesite_alloy',
    C: CR.ITEMS.cristal,
    B: 'create:brass_casing'
  }).id('kubejs:gates/mechanical_arm')

  console.log('[cristal_mana_pura/gates] 2 receitas modificadas (djinni book + mechanical_arm)')
})

})()
