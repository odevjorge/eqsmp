// =========================================================================
// CRISTAL DE MANA PURA — Config
// =========================================================================
// Phase 3 cross-mod gate. Signature item Botania — pearl refinada em
// runic_altar (F2 gate) e purificada em imbuement_chamber (Ars Nouveau).
// Consumida por Occultism (book_of_binding_djinni) e Create (mechanical_arm).
//
// Production chain:
//   mana_pearl + mana_diamond + nucleo_cinetico (F2 link explícito)
//     → runic_altar (Botania, F2-gated bloco)
//     → cursed_cristal_mana_pura (intermediate)
//     → imbuement_chamber (Ars Nouveau, source-charged)
//     → cristal_mana_pura (final)
//
// Cross-mod gates desbloqueados (consumers):
//   Occultism: book_of_binding_djinni (recipe override, parallel ao F1's foliot)
//   Create:    mechanical_arm          (recipe override, substitui precision_mechanism)

;(function() {

global.CristalManaPura = {}
var CR = global.CristalManaPura

CR.ITEMS = {
  cristal: 'kubejs:cristal_mana_pura',
  cursed:  'kubejs:cursed_cristal_mana_pura'
}

CR.RUNIC_MANA_COST = 25000   // 25k mana — mid-high tier runic_altar
CR.IMBUEMENT_SOURCE_COST = 5000  // 5k source — high tier imbuement

})()
